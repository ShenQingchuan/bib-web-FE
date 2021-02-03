import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
  InputRule,
} from "prosemirror-inputrules";
import {
  Schema,
  NodeType,
  Node,
  Mark,
  MarkType,
  Slice,
  Fragment,
} from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";

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
  return wrappingInputRule(/^\s*>\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    (match) => ({ order: +match[1] }),
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

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
export function codeBlockRule(nodeType: NodeType) {
  return textblockTypeInputRule(/^```(\w+)?\s$/, nodeType, (match) => {
    return { lang: match[1] };
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
    (match) => ({ level: match[1].length })
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
      ...node.marks.map((mark) => ({
        start: pos,
        end: pos + node.nodeSize,
        mark,
      })),
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
          .filter((item) => {
            const { excluded } = item.mark.type;
            return excluded.find((type: any) => type.name === markType.name);
          })
          .filter((item) => item.end > matchStart);

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

export function markPasteRule(regexp: RegExp, type: MarkType, getAttrs?: any) {
  const handler = (fragment: Fragment, parent?: any) => {
    const nodes: Node[] = [];

    fragment.forEach((child) => {
      if (child.isText) {
        const { text, marks } = child;
        let pos = 0;
        let match;

        const isLink = !!marks.filter((x) => x.type.name === "link")[0];

        // eslint-disable-next-line
        while (!isLink && (match = regexp.exec(text!)) !== null) {
          if (parent?.type.allowsMarkType(type) && match[1]) {
            const start = match.index;
            const end = start + match[0].length;
            const textStart = start + match[0].indexOf(match[1]);
            const textEnd = textStart + match[1].length;
            const attrs =
              getAttrs instanceof Function ? getAttrs(match) : getAttrs;

            // adding text before markdown to nodes
            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            // adding the markdown part to nodes
            nodes.push(
              child
                .cut(textStart, textEnd)
                .mark(type.create(attrs).addToSet(child.marks))
            );

            pos = end;
          }
        }

        // adding rest of text to nodes
        if (pos < text!.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content, child)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: (slice) =>
        new Slice(handler(slice.content), slice.openStart, slice.openEnd),
    },
  });
}

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export function buildInputRules(schema: Schema) {
  let rules = smartQuotes.concat(ellipsis, emDash),
    type;

  // nodes rules:
  if ((type = schema.nodes.blockquote)) rules.push(blockQuoteRule(type));
  if ((type = schema.nodes.ordered_list)) rules.push(orderedListRule(type));
  if ((type = schema.nodes.bullet_list)) rules.push(bulletListRule(type));
  if ((type = schema.nodes.code_block)) rules.push(codeBlockRule(type));
  if ((type = schema.nodes.heading)) rules.push(headingRule(type, 5));
  if ((type = schema.nodes.horizontal_rule)) rules.push(horizontalRule(type));

  // mark rules:
  if ((type = schema.marks.code))
    rules.push(markInputRule(/(?:`)([^`]+)(?:`)$/, type));
  if ((type = schema.marks.em))
    rules.push(markInputRule(/(?:\_)([^`]+)(?:\_)/g, type));
  if ((type = schema.marks.strong))
    rules.push(markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type));

  return inputRules({ rules });
}

export function buildPasteRules(schema: Schema) {
  let type,
    rules: Plugin[] = [];

  if ((type = schema.marks.code))
    rules.push(markPasteRule(/(?:`)([^`]+)(?:`)/g, type));
  if ((type = schema.marks.strong))
    rules.push(markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type));

  return rules;
}
