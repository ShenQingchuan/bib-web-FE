import { Schema, Node, Mark } from "prosemirror-model";
import { tableNodes } from "prosemirror-tables";
import us from "underscore";

const blockquoteDOM = ["blockquote", 0],
  brDOM = ["br"],
  emDOM = ["em", 0],
  delDOM = ["del", 0],
  supDOM = ["sup", 0],
  subDOM = ["sub", 0],
  uDOM = ["u", 0],
  strongDOM = ["strong", 0],
  codeDOM = ["code", 0],
  olDOM = ["ol", 0];

const extends_textBlockAttrs = (
  others: Record<string, any> = {},
  excludes?: string[]
) => {
  let textBlockAttrs: Record<string, any> = us.extend(
    {
      textAlign: { default: "" },
      textIndent: { default: 0 },
    },
    others
  );
  if (excludes) {
    textBlockAttrs = us.omit(textBlockAttrs, ...excludes);
  }
  return textBlockAttrs;
};
const stylesOfTextBlock = (node: Node, append?: (node: Node) => string) => {
  let style = "";
  if (node.attrs.textAlign) {
    style += `text-align:${node.attrs.textAlign};`;
  }
  if (node.attrs.textIndent > 0) {
    style += `padding-left:${node.attrs.textIndent}em;`;
  }
  // ... more styles

  if (append) {
    style = style + append(node);
  }
  return style;
};
const extendsTextBlockStyleAttrs = (
  computeOther?: (_dom: HTMLElement) => Record<string, any>
) => (dom: HTMLElement) => {
  let textBlockStylesAttrs: Record<string, any> = {};
  if (!!dom.style.textAlign) {
    textBlockStylesAttrs.textAlign = dom.style.textAlign;
  }
  if (!!dom.style.paddingLeft) {
    if (dom.style.paddingLeft.endsWith("px")) {
      const paddingNumber = Number(dom.style.paddingLeft.slice(0, -2));
      textBlockStylesAttrs.textIndent = paddingNumber;
    }
  }

  const otherAttrs = computeOther ? computeOther(dom) : {};
  return {
    ...otherAttrs,
    ...textBlockStylesAttrs,
  };
};
const getCommentAttrs = (el: HTMLElement) => {
  const id = el.getAttribute("bib-comment-id");
  const content = el.getAttribute("bib-comment-content");
  if (!id && !content) return false;
  return { id, content }
}
export const listTypeNames = ["ordered_list", "bullet_list", "task_list"];

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes: {
  [key: string]: any;
} = {
  // :: NodeSpec The top level document node.
  doc: {
    content: "block+",
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    attrs: extends_textBlockAttrs(),
    content: "inline*",
    group: "block",
    parseDOM: [
      {
        tag: "p",
        getAttrs: extendsTextBlockStyleAttrs(),
      },
    ],
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      return ["p", { style }, 0];
    },
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM() {
      return blockquoteDOM;
    },
  },

  // :: NodeSpec A horizontal line (`<hr>`).
  horizontal_line: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ["hr", { contenteditable: "false" }];
    },
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: extends_textBlockAttrs({ level: { default: 1 } }),
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      {
        tag: "h1",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 1 })),
      },
      {
        tag: "h2",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 2 })),
      },
      {
        tag: "h3",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 3 })),
      },
      {
        tag: "h4",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 4 })),
      },
      {
        tag: "h5",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 5 })),
      },
      {
        tag: "h6",
        getAttrs: extendsTextBlockStyleAttrs(() => ({ level: 6 })),
      },
    ],
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      return ["h" + node.attrs.level, { style }, 0];
    },
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  code_block: {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    attrs: { lang: { default: "" } },
    toDOM() {
      return ["code_block", 0];
    },
  },

  // :: NodeSpec The text node.
  text: {
    group: "inline",
  },

  // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // `alt`, and `href` attributes. The latter two default to the empty
  // string.
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: undefined },
      title: { default: undefined },
    },
    group: "inline",
    draggable: true,
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs(dom: any) {
          return {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt"),
          };
        },
      },
    ],
    toDOM(node: Node) {
      let { src, alt, title } = node.attrs;
      return ["img", { src, alt, title, class: "bib-editor-doc-img" }];
    },
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return brDOM;
    },
  },

  ordered_list: {
    attrs: { order: { default: 1 }, textIndent: { default: 0 } },
    group: "block",
    content: "list_item+",
    parseDOM: [
      {
        tag: "ol",
        getAttrs(dom: any) {
          return {
            order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
          };
        },
      },
    ],
    toDOM(node: Node) {
      return node.attrs.order == 1
        ? olDOM
        : ["ol", { start: node.attrs.order }, 0];
    },
  },
  bullet_list: {
    attrs: { textIndent: { default: 0 } },
    group: "block",
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM() {
      return ["ul", 0];
    },
  },
  task_list: {
    attrs: { textIndent: { default: 0 } },
    group: "block",
    content: "task_item+",
    parseDOM: [
      {
        tag: 'ul[data-type="task-list"]',
        priority: 51,
      },
    ],
    toDOM() {
      return ["ul", { "data-type": "task-list" }, 0];
    },
  },
  list_item: {
    attrs: extends_textBlockAttrs(undefined, ["textIndent"]),
    content: "paragraph block*",
    defining: true,
    parseDOM: [
      {
        tag: "li",
        getAttrs: extendsTextBlockStyleAttrs(),
      },
    ],
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      return ["li", { style }, 0];
    },
  },
  task_item: {
    attrs: extends_textBlockAttrs({ checked: { default: false } }, [
      "textIndent",
    ]),
    content: "paragraph block*",
    defining: true,
    parseDOM: [
      {
        tag: 'li[data-type="task-item"][data-checked]',
        priority: 51,
        getAttrs: extendsTextBlockStyleAttrs((dom) => {
          return {
            checked: dom.getAttribute("data-checked") === "true",
          };
        }),
      },
    ],
    toDOM() {
      return ["task_item", 0];
    },
  },

  // prosemirror-math:
  math_inline: {
    group: "inline math",
    content: "text*", // important!
    inline: true, // important!
    atom: true, // important!
    toDOM: () => ["math-inline", { class: "math-node" }, 0],
    parseDOM: [
      {
        tag: "math-inline", // important!
      },
    ],
  },
  math_display: {
    group: "block math",
    content: "text*", // important!
    atom: true, // important!
    code: true, // important!
    toDOM: () => ["math-display", { class: "math-node" }, 0],
    parseDOM: [
      {
        tag: "math-display", // important!
      },
    ],
  },

  // video-iframe:
  video_iframe: {
    attrs: { src: { default: "" } },
    defining: true,
    group: "block",
    parseDOM: [
      {
        tag: 'iframe[class="prosemirror-video-iframe"]',
        getAttrs(dom: HTMLIFrameElement) {
          return {
            src: dom.src,
          };
        },
      },
    ],
    toDOM() {
      return ["video_iframe", 0];
    },
  },

  ...tableNodes({
    tableGroup: "block",
    cellContent: "block+",
    cellAttributes: {
      background: {
        default: null,
        getFromDOM(dom: any) {
          return dom.style.backgroundColor || null;
        },
        setDOMAttr(value, attrs) {
          if (value) {
            attrs.style = (attrs.style || "") + `background-color: ${value};`;
          }
        },
      },
    },
  }),
};

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks: {
  [key: string]: any;
} = {
  // :: MarkSpec A link. Has `href` and `label` attributes. `label`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  link: {
    attrs: {
      href: { default: "" },
      text: { default: "" },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs(dom: HTMLElement) {
          const href = dom.getAttribute("href");
          const text = dom.textContent;
          return {
            href,
            text,
          };
        },
      },
    ],
    toDOM(mark: Mark) {
      let { href, text } = mark.attrs;
      return ["a", { href }, text];
    },
  },

  colored: {
    attrs: { color: { default: "" } },
    group: "inline",
    content: "text*",
    parseDOM: [
      {
        tag: "span",
        style: "color",
        getAttrs(el: HTMLElement) {
          return {
            color: el.style.color,
          };
        },
      },
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.color) {
        style += `color: ${mark.attrs.color};`;
      }
      return ["span", { style }, 0];
    },
  },
  fontSizeMark: {
    attrs: { size: { default: 14 } },
    group: "inline",
    content: "text*",
    parseDOM: [
      {
        tag: "span",
        style: "font-size",
        getAttrs(el: HTMLElement) {
          return {
            fontSize: el.style.fontSize,
          };
        },
      },
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.size) {
        style += `font-size: ${mark.attrs.size}px;`;
      }
      return ["span", { style }, 0];
    },
  },
  hightlighted: {
    attrs: { color: { default: "" } },
    group: "inline",
    content: "text*",
    parseDOM: [
      {
        tag: "span",
        style: "background-color",
        getAttrs(el: HTMLElement) {
          return {
            color: el.style.backgroundColor,
          };
        },
      },
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.color) {
        style += `background-color: ${mark.attrs.color};`;
      }
      return ["span", { style }, 0];
    },
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM() {
      return emDOM;
    },
  },

  u: {
    parseDOM: [{ tag: "u" }],
    toDOM() {
      return uDOM;
    },
  },
  // :: MarkSpec An delete mark. Rendered as an `<del>` element.
  del: {
    parseDOM: [{ tag: "del" }],
    toDOM() {
      return delDOM;
    },
  },
  // :: MarkSpec An superscript mark. Rendered as an `<sup>` element.
  sup: {
    excludes: "sub",
    parseDOM: [{ tag: "sup" }],
    toDOM() {
      return supDOM;
    },
  },
  // :: MarkSpec An subscript mark. Rendered as an `<sub>` element.
  sub: {
    excludes: "sup",
    parseDOM: [{ tag: "sub" }],
    toDOM() {
      return subDOM;
    },
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [
      { tag: "strong" },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: "b",
        getAttrs: (node: any) => node.style.fontWeight != "normal" && null,
      },
      {
        style: "font-weight",
        getAttrs: (value: any) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
      },
    ],
    toDOM() {
      return strongDOM;
    },
  },

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  code: {
    excludes: "_",
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return codeDOM;
    },
  },

  // :: Commented mark. Rendered as original element but with comment content
  // in attributes. use Vue view layer card component to show
  commented: {
    attrs: {
      id: { default: "" },
      content: { default: {} }
    },
    parseDOM: [
      {
        tag: "span",
        getAttrs: getCommentAttrs,
      },
    ],
    toDOM(mark: Mark) {
      const { id, content } = mark.attrs
      return ['span', {
        'bib-comment-id': id,
        'bib-comment-content': JSON.stringify(content)
      }, 0]
    }
  },
};

export const EditorSchema = new Schema({
  marks,
  nodes,
});
