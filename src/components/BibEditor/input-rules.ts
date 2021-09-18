import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
  InputRule
} from "prosemirror-inputrules";
import {
  Schema,
  NodeType,
  MarkType,
  Slice,
  Fragment,
  Node
} from "prosemirror-model";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import {
  makeBlockMathInputRule,
  makeInlineMathInputRule,
  REGEX_INLINE_MATH_DOLLARS,
  REGEX_BLOCK_MATH_DOLLARS
} from "@benrbray/prosemirror-math";
import { URL_REGEX, getUUID } from "@/utils";

function nodeInputRule(
  regexp: RegExp,
  type: NodeType,
  getAttrs?:
    | { [key: string]: any }
    | ((p: string[]) => { [key: string]: any } | null | undefined)
) {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const { tr } = state;

    if (match[0]) {
      tr.replaceWith(start - 1, end, type!.create(attrs));
    }

    return tr;
  });
}

// : (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
export function blockQuoteRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*[>》]\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)[\.。]\s$/,
    nodeType,
    match => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  );
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
export function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

export function taskListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*((\[\])|(【】))\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
export function codeBlockRule(nodeType: NodeType) {
  return textblockTypeInputRule(/^(```|···)(\w+)?\s$/, nodeType, match => {
    return { lang: match[2], uuid: getUUID(6) };
  });
}

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
export function headingRule(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(
    new RegExp("^(#{1," + maxLevel + "})\\s$"),
    nodeType,
    match => ({ level: match[1].length })
  );
}

export function horizontalRule(nodeType: NodeType) {
  return nodeInputRule(/^\*\*\*$/, nodeType);
}

function getMarksBetween(start: number, end: number, state: EditorState) {
  let marks: any[] = [];

  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [
      ...marks,
      ...node.marks.map(mark => ({
        start: pos,
        end: pos + node.nodeSize,
        mark
      }))
    ];
  });

  return marks;
}

export function markInputRule(
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: any
) {
  return new InputRule(
    regexp,
    (state: EditorState, match: string[], start: number, end: number) => {
      const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
      const { tr } = state;
      const m = match.length - 1;
      let markEnd = end;
      let markStart = start;

      if (match[m]) {
        const matchStart = start + match[0].indexOf(match[m - 1]);
        const matchEnd = matchStart + match[m - 1].length - 1;
        const textStart = matchStart + match[m - 1].lastIndexOf(match[m]);
        const textEnd = textStart + match[m].length;

        const excludedMarks = getMarksBetween(start, end, state)
          .filter(item => {
            const { excluded } = item.mark.type;
            return excluded.find((type: any) => type.name === markType.name);
          })
          .filter(item => item.end > matchStart);

        if (excludedMarks.length) {
          return null;
        }

        if (textEnd < matchEnd) {
          tr.delete(textEnd, matchEnd);
        }
        if (textStart > matchStart) {
          tr.delete(matchStart, textStart);
        }
        markStart = matchStart;
        markEnd = markStart + match[m].length;
      }

      tr.addMark(markStart, markEnd, markType.create(attrs));
      tr.removeStoredMark(markType);
      return tr;
    }
  );
}

export function markPasteRule(
  regexp: RegExp,
  type: MarkType,
  getAttrs?: (match: any) => any
): Plugin {
  const handler = (fragment: Fragment, parent?: any) => {
    const nodes: Node[] = [];

    fragment.forEach(child => {
      if (child.isText && child.text) {
        const { text } = child;
        let pos = 0;
        let match;

        // eslint-disable-next-line
        while ((match = regexp.exec(text)) !== null) {
          const outerIndex = Math.max(match.length - 2, 0),
            innerIndex = Math.max(match.length - 1, 0),
            outerMatch = match[outerIndex],
            innerMatch = match[innerIndex];

          if (parent.type.allowsMarkType(type)) {
            const start = match.index,
              matchStart = start + match[0].indexOf(outerMatch),
              matchEnd = matchStart + outerMatch.length;
            let textStart, textEnd;
            if (!innerMatch) {
              textStart = matchStart;
              textEnd = matchEnd;
            } else {
              textStart = matchStart + outerMatch.lastIndexOf(innerMatch);
              textEnd = textStart + innerMatch.length;
            }

            const attrs =
              getAttrs instanceof Function ? getAttrs(match) : getAttrs;

            // adding text before markdown to nodes
            if (matchStart > 0) {
              nodes.push(child.cut(pos, matchStart));
            }

            // adding the markdown part to nodes
            nodes.push(
              child
                .cut(textStart, textEnd)
                .mark(type.create(attrs).addToSet(child.marks))
            );

            pos = matchEnd;
          }
        }

        // adding rest of text to nodes
        if (pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content, child)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    key: new PluginKey("markPasteRule"),
    props: {
      transformPasted: slice => {
        return new Slice(
          handler(slice.content),
          slice.openStart,
          slice.openEnd
        );
      }
    }
  });
}

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export function buildInputRules(schema: Schema) {
  const rules = smartQuotes.concat(ellipsis, emDash);
  let type;

  // nodes rules:
  if ((type = schema.nodes.blockquote)) rules.push(blockQuoteRule(type));
  if ((type = schema.nodes.ordered_list)) rules.push(orderedListRule(type));
  if ((type = schema.nodes.bullet_list)) rules.push(bulletListRule(type));
  if ((type = schema.nodes.task_list)) rules.push(taskListRule(type));
  if ((type = schema.nodes.code_block)) rules.push(codeBlockRule(type));
  if ((type = schema.nodes.heading)) rules.push(headingRule(type, 5));
  if ((type = schema.nodes.horizontal_line)) rules.push(horizontalRule(type));

  // mark rules:
  if ((type = schema.marks.code))
    rules.push(markInputRule(/(?:`)([^`]+)(?:`)$/, type));
  if ((type = schema.marks.em))
    rules.push(markInputRule(/(?:\_)([^`]+)(?:\_)/g, type));
  if ((type = schema.marks.strong))
    rules.push(markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type));

  // create input rules for mathjax
  rules.push(
    makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline)
  );
  rules.push(
    makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display)
  );

  return inputRules({ rules });
}

export function buildPasteRules(schema: Schema) {
  let type;
  const rules: Plugin[] = [];

  if ((type = schema.marks.code))
    rules.push(markPasteRule(/(?:`)([^`]+)(?:`)/g, type));
  if ((type = schema.marks.strong))
    rules.push(markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type));
  if ((type = schema.marks.link)) {
    rules.push(
      markPasteRule(URL_REGEX, type, (match: string[]) => ({
        href: match[0],
        text: match[0]
      }))
    );
  }

  return rules;
}
