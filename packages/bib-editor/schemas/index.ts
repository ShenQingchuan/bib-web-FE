import { getUUID } from "@/utils";
import { Schema, Node, Mark } from "prosemirror-model";
import { tableNodes } from "prosemirror-tables";

import {
  extendsTextBlockAttrs,
  stylesOfTextBlock,
  getTextBlockStyleAttrs
} from "./common";
import { getHeadingAttrs } from "./heading";

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

const getCommentAttrs = (el: HTMLElement) => {
  const id = el.getAttribute("bib-comment-id");
  const content = el.getAttribute("bib-comment-content");
  if (!id && !content) return false;
  return { id, content };
};
export const listTypeNames = ["ordered_list", "bullet_list", "task_list"];

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes: {
  [key: string]: any;
} = {
  // :: NodeSpec The top level document node.
  doc: {
    content: "block+"
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    attrs: extendsTextBlockAttrs(),
    content: "inline*",
    group: "block",
    parseDOM: [
      {
        tag: "p",
        getAttrs: getTextBlockStyleAttrs()
      }
    ],
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      return ["p", { style }, 0];
    }
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM() {
      return blockquoteDOM;
    }
  },

  // :: NodeSpec A horizontal line (`<hr>`).
  horizontal_line: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ["hr", { contenteditable: "false" }];
    }
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  heading: {
    attrs: extendsTextBlockAttrs({
      level: { default: 1 },
      uuid: { default: "" }
      // 不在 Schema 中提供默认值，
      // 否则会使所有的 heading 的 id 都是同一个，
      // 在创建时显式生成 UUID
    }),
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: Array(6).map((_, i) => ({
      tag: `h${i + 1}`,
      getAttrs: getHeadingAttrs
    })),
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      const { level, uuid } = node.attrs;
      return [
        "h" + (level ?? ""),
        {
          style,
          id: uuid ?? getUUID(6)
          // 若 Node 的 Attrs 没有 uuid，说明是没有生成过 id 的 heading
          // 这里兜底在编辑文档时帮生成一个，保存之后重新加载时，ProseMirror 中通过 parseDOM 就能拿到 attrs.uuid 了
        },
        0
      ];
    }
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  code_block: {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    attrs: {
      uuid: { default: getUUID(6) },
      lang: { default: "" }
    },
    parseDOM: [
      {
        tag: "code_block",
        preserveWhitespace: "full",
        getAttrs(dom: HTMLElement) {
          return {
            lang: dom.getAttribute("lang") || ""
          };
        }
      }
    ],
    toDOM(node: Node) {
      const { attrs } = node;
      return [
        "code_block",
        { lang: attrs.lang, uuid: attrs.uuid },
        node.textContent
      ];
    }
  },

  // :: NodeSpec The text node.
  text: {
    group: "inline"
  },

  // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // `alt`, and `href` attributes. The latter two default to the empty
  // string.
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: undefined },
      title: { default: undefined }
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
            alt: dom.getAttribute("alt")
          };
        }
      }
    ],
    toDOM(node: Node) {
      const { src, alt, title } = node.attrs;
      return ["img", { src, alt, title, class: "bib-editor-doc-img" }];
    }
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return brDOM;
    }
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
            order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1
          };
        }
      }
    ],
    toDOM(node: Node) {
      return node.attrs.order == 1
        ? olDOM
        : ["ol", { start: node.attrs.order }, 0];
    }
  },
  bullet_list: {
    attrs: { textIndent: { default: 0 } },
    group: "block",
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM() {
      return ["ul", 0];
    }
  },
  task_list: {
    attrs: { textIndent: { default: 0 } },
    group: "block",
    content: "task_item+",
    parseDOM: [
      {
        tag: 'ul[data-type="task-list"]',
        priority: 51
      }
    ],
    toDOM() {
      return ["ul", { "data-type": "task-list" }, 0];
    }
  },
  list_item: {
    attrs: extendsTextBlockAttrs(undefined, ["textIndent"]),
    content: "paragraph block*",
    defining: true,
    parseDOM: [
      {
        tag: "li",
        getAttrs: getTextBlockStyleAttrs()
      }
    ],
    toDOM(node: Node) {
      const style = stylesOfTextBlock(node);
      return ["li", { style }, 0];
    }
  },
  task_item: {
    attrs: extendsTextBlockAttrs({ checked: { default: false } }, [
      "textIndent"
    ]),
    content: "paragraph block*",
    defining: true,
    parseDOM: [
      {
        tag: 'li[data-type="task-item"][data-checked]',
        priority: 51,
        getAttrs: getTextBlockStyleAttrs(dom => {
          return {
            checked: dom.getAttribute("data-checked") === "true"
          };
        })
      }
    ],
    toDOM() {
      return ["task_item", 0];
    }
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
        tag: "math-inline" // important!
      }
    ]
  },
  math_display: {
    group: "block math",
    content: "text*", // important!
    atom: true, // important!
    code: true, // important!
    toDOM: () => ["math-display", { class: "math-node" }, 0],
    parseDOM: [
      {
        tag: "math-display" // important!
      }
    ]
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
            src: dom.src
          };
        }
      }
    ],
    toDOM() {
      return ["video_iframe", 0];
    }
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
        }
      }
    }
  })
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
      text: { default: "" }
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
            text
          };
        }
      }
    ],
    toDOM(mark: Mark) {
      const { href, text } = mark.attrs;
      return ["a", { href }, text];
    }
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
            color: el.style.color
          };
        }
      }
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.color) {
        style += `color: ${mark.attrs.color};`;
      }
      return ["span", { style }, 0];
    }
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
            fontSize: el.style.fontSize
          };
        }
      }
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.size) {
        style += `font-size: ${mark.attrs.size}px;`;
      }
      return ["span", { style }, 0];
    }
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
            color: el.style.backgroundColor
          };
        }
      }
    ],
    toDOM(mark: Mark) {
      let style = "";
      if (mark.attrs.color) {
        style += `background-color: ${mark.attrs.color};`;
      }
      return ["span", { style }, 0];
    }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM() {
      return emDOM;
    }
  },

  u: {
    parseDOM: [{ tag: "u" }],
    toDOM() {
      return uDOM;
    }
  },
  // :: MarkSpec An delete mark. Rendered as an `<del>` element.
  del: {
    parseDOM: [{ tag: "del" }],
    toDOM() {
      return delDOM;
    }
  },
  // :: MarkSpec An superscript mark. Rendered as an `<sup>` element.
  sup: {
    excludes: "sub",
    parseDOM: [{ tag: "sup" }],
    toDOM() {
      return supDOM;
    }
  },
  // :: MarkSpec An subscript mark. Rendered as an `<sub>` element.
  sub: {
    excludes: "sup",
    parseDOM: [{ tag: "sub" }],
    toDOM() {
      return subDOM;
    }
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
        getAttrs: (node: any) => node.style.fontWeight != "normal" && null
      },
      {
        style: "font-weight",
        getAttrs: (value: any) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      }
    ],
    toDOM() {
      return strongDOM;
    }
  },

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  code: {
    excludes: "_",
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return codeDOM;
    }
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
        getAttrs: getCommentAttrs
      }
    ],
    toDOM(mark: Mark) {
      const { id, content } = mark.attrs;
      return [
        "span",
        {
          "bib-comment-id": id,
          "bib-comment-content": JSON.stringify(content)
        },
        0
      ];
    }
  }
};

export const EditorSchema = new Schema({
  marks,
  nodes
});
