import { Schema } from "prosemirror-model";

const pDOM = ["p", 0],
  blockquoteDOM = ["blockquote", 0],
  hrDOM = ["hr"],
  brDOM = ["br"],
  emDOM = ["em", 0],
  strongDOM = ["strong", 0],
  codeDOM = ["code", 0],
  olDOM = ["ol", 0],
  ulDOM = ["ul", 0],
  liDOM = ["li", 0];

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
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return pDOM;
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

  // :: NodeSpec A horizontal rule (`<hr>`).
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return hrDOM;
    },
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } },
    ],
    toDOM(node: any) {
      return ["h" + node.attrs.level, 0];
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
      alt: { default: null },
      title: { default: null },
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
    toDOM(node: any) {
      let { src, alt, title } = node.attrs;
      return ["img", { src, alt, title }];
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
    group: "block",
    content: "list_item+",
    attrs: { order: { default: 1 } },
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
    toDOM(node: any) {
      return node.attrs.order == 1
        ? olDOM
        : ["ol", { start: node.attrs.order }, 0];
    },
  },
  bullet_list: {
    group: "block",
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM() {
      return ulDOM;
    },
  },
  list_item: {
    group: "block",
    content: "paragraph block*",
    parseDOM: [{ tag: "li" }],
    toDOM() {
      return liDOM;
    },
    defining: true,
  },
};

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks: {
  [key: string]: any;
} = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  link: {
    attrs: {
      href: {},
      title: { default: null },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs(dom: any) {
          return {
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title"),
          };
        },
      },
    ],
    toDOM(node: any) {
      let { href, title } = node.attrs;
      return ["a", { href, title }, 0];
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
};

export const EditorSchema = new Schema({
  marks,
  nodes,
});