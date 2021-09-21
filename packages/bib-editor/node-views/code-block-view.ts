import { Ref, ref, createApp, watch } from "vue";
import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { exitCode } from "prosemirror-commands";
import { undo, redo } from "y-prosemirror";
import CodeMirror from "codemirror";
import {
  EditorState,
  Selection,
  TextSelection,
  Transaction
} from "prosemirror-state";
import { EditorSchema } from "@editor/editor-schema";
import { keymap } from "prosemirror-keymap";
import { omit } from "underscore";
import CodeBlockLangSwitcher from "@editor/components/code-block-lang-switcher.vue";
import { Dropdown, Menu } from "ant-design-vue";

function computeChange(oldVal: any, newVal: any) {
  if (oldVal == newVal) return null;
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length;
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start))
    ++start;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}
function arrowHandler(
  dir: "up" | "down" | "left" | "right" | "forward" | "backward"
) {
  return (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    view?: EditorView
  ) => {
    if (state.selection.empty && view?.endOfTextblock(dir)) {
      const side = dir == "left" || dir == "up" ? -1 : 1,
        $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (nextPos.$head && nextPos.$head.parent.type.name == "code_block") {
        dispatch!(state.tr.setSelection(nextPos));
        return true;
      }
    }
    return false;
  };
}

const MIMEMap = {
  "": "text/plain",
  c: "text/x-csrc",
  cpp: "text/x-c++src",
  "c++": "text/x-c++src",
  csharp: "text/x-csharp",
  "c#": "text/x-csharp",
  java: "text/x-java",
  scala: "text/x-scala",
  javascript: "javascript",
  js: "javascript",
  typescript: "text/typescript",
  ts: "text/typescript",
  objc: "text/x-objectivec",
  "objective-c": "text/x-objectivec",
  php: "application/x-httpd-php",
  py: "text/x-python",
  python: "text/x-python",
  go: "text/x-go",
  swift: "text/x-swift",
  lua: "text/x-lua",
  sass: "text/x-sass",
  rust: "text/x-rustsrc",
  jsx: "text/jsx",
  tsx: "text/typescript-jsx",
  dart: "dart"
};
const langSimplify: Record<string, string> = {
  cpp: "c++",
  csharp: "c#",
  js: "javascript",
  ts: "typescript",
  objc: "objective-c",
  py: "python"
};
export const capitalizeLangSpec = (str: string) => {
  return str ? (str[0].toUpperCase() + str.slice(1)).trim() : "Plain Text";
};
export const supportLangs: Array<string> = Object.keys(
  omit(MIMEMap, ...Object.keys(langSimplify))
).map(capitalizeLangSpec);
export const MIMEReflect = (lang?: keyof typeof MIMEMap) =>
  lang ? MIMEMap[lang] || "" : "";

export const arrowHandlersInCodeBlock = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down")
});

export const overlayClassName = "bib-editor__code-block-overlay";
export class CodeBlockView implements NodeView {
  dom: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: any;
  incomingChanges: boolean;
  cm: CodeMirror.Editor;
  uuid: string;
  lang: Ref<keyof typeof MIMEMap>;
  tryDeleting: Ref<boolean>;
  onViewFocusEventListner: () => void;
  updating: boolean;
  langSwitcher: HTMLElement;

  constructor(node: Node, view: EditorView, getPos: (() => number) | boolean) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.incomingChanges = false;
    this.uuid = node.attrs.uuid;
    const langAttr = node.attrs.lang;
    this.lang = ref<keyof typeof MIMEMap>(
      langAttr ? langSimplify[langAttr] || langAttr : ""
    );

    // 不继承 node.attrs.tryDeleting，每次创建重新置为 false
    this.tryDeleting = ref(false);
    this.onViewFocusEventListner = () => {
      this.tryDeleting.value = false;
    };

    // 新建一个 CodeMirror 实例
    this.cm = CodeMirror(null as any, {
      value: this.node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap(),
      mode: MIMEReflect(this.lang.value),
      scrollbarStyle: "null",
      viewportMargin: Infinity
    });

    // 创建最外层 wrapper
    const dom = document.createElement("div");
    dom.style.cssText = `position: relative; max-width: 800px;`;
    const cmDom = this.cm.getWrapperElement();
    cmDom.classList.add("bib-editor__code-block");
    dom.appendChild(cmDom);
    this.dom = dom;

    // CodeMirror 需要在 DOM 中被合适的初始化，因此设置个定时器让它更新自身
    setTimeout(() => this.cm.refresh(), 20);
    // 这个标记用来避免在外部编辑器和内部编辑器之间的循环更新
    this.updating = false;
    // 追踪是否改变已经发生，但是还没有传递出去
    this.cm.on("beforeChange", () => (this.incomingChanges = true));
    // 将代码编辑器的更新传递给外层的 ProseMirror
    this.cm.on("cursorActivity", () => {
      if (!this.updating && !this.incomingChanges) this.forwardSelection();
    });
    this.cm.on("changes", () => {
      if (!this.updating) {
        this.valueChanged();
        this.forwardSelection();
      }
      this.incomingChanges = false;
    });
    this.cm.on("focus", () => {
      this.tryDeleting.value = false;
      this.dom.classList.remove(overlayClassName);
      this.forwardSelection();
    });

    // 在 code block 右上角显示一个用来表示语法模式的标签
    const ls = document.createElement("div");
    createApp(CodeBlockLangSwitcher, {
      lang: this.lang,
      disabled: !this.view.editable,
      setLangSpec: (s: string) => {
        this.lang.value = s as any;
      }
    })
      .use(Dropdown)
      .use(Menu)
      .mount(ls);
    watch(this.lang, newValue => {
      this.cm.setOption("mode", MIMEReflect(newValue));
      this.updateAttrs({
        lang: newValue
      });
    });
    watch(this.tryDeleting, newValue => {
      // 刚刚全部删除时留一个可以再编辑的机会
      newValue
        ? this.dom.classList.add(overlayClassName)
        : this.dom.classList.remove(overlayClassName);
    });

    this.langSwitcher = ls;
    this.dom.appendChild(this.langSwitcher);
    this.dom.classList.add("bib-editor__code-block-container");
    this.dom.setAttribute("uuid", this.uuid);
    this.view.dom.addEventListener("focus", this.onViewFocusEventListner);
  }

  updateAttrs(updates: Record<string, any>) {
    this.view.dispatch(
      this.view.state.tr.setNodeMarkup(
        this.getPos(),
        EditorSchema.nodes.code_block,
        {
          ...this.node.attrs,
          ...updates
        }
      )
    );
  }
  forwardSelection() {
    if (!this.cm.hasFocus()) return;
    const state = this.view.state;
    const selection = this.asProseMirrorSelection(state.doc);
    if (!selection.eq(state.selection))
      this.view.dispatch(state.tr.setSelection(selection));
  }
  asProseMirrorSelection(doc: Node) {
    const offset = this.getPos() + 1;
    const anchor = this.cm.indexFromPos(this.cm.getCursor("anchor")) + offset;
    const head = this.cm.indexFromPos(this.cm.getCursor("head")) + offset;
    return TextSelection.create(doc, anchor, head);
  }
  setSelection(anchor: number, head: number) {
    this.cm.focus();
    this.updating = true;
    this.cm.setSelection(
      this.cm.posFromIndex(anchor),
      this.cm.posFromIndex(head)
    );
    this.updating = false;
  }
  valueChanged() {
    const change = computeChange(this.node.textContent, this.cm.getValue());
    if (change) {
      const start = this.getPos() + 1;
      const tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? EditorSchema.text(change.text) : (null as any)
      );
      this.view.dispatch(tr);
    }
  }
  codeMirrorKeymap() {
    const view = this.view;
    const mod = /Mac/.test(navigator.platform) ? "Cmd" : "Ctrl";
    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape("line", -1),
      Left: () => this.maybeEscape("char", -1),
      Down: () => this.maybeEscape("line", 1),
      Right: () => this.maybeEscape("char", 1),
      [`${mod}-Enter`]: instance => {
        if (exitCode(view.state, view.dispatch)) view.focus();
      },
      [`${mod}-Z`]: () => undo(view.state),
      [`Shift-${mod}-Z`]: () => redo(view.state),
      [`${mod}-Y`]: () => redo(view.state)
    });
  }
  maybeEscape(unit: string, dir: number) {
    const pos = this.cm.getCursor();
    if (
      this.cm.somethingSelected() ||
      pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit === "char" &&
        pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    )
      return CodeMirror.Pass;
    this.view.focus();
    const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
    const selection = Selection.near(
      this.view.state.doc.resolve(targetPos),
      dir
    );
    this.view.dispatch(
      this.view.state.tr.setSelection(selection).scrollIntoView()
    );
    this.view.focus();
  }
  update(node: Node) {
    if (node.type != this.node.type) return false;
    this.node = node;
    const change = computeChange(this.cm.getValue(), node.textContent);
    if (change) {
      this.updating = true;
      this.cm.replaceRange(
        change.text,
        this.cm.posFromIndex(change.from),
        this.cm.posFromIndex(change.to)
      );
      this.updating = false;
    }
    return true;
  }
  selectNode() {
    this.cm.focus();
  }
  deleteBlockNode() {
    const codeBlockPos = this.getPos();
    const codeBlockEnd =
        this.getPos() + this.cm.getValue().length + 3 /* pos offset */;
    this.view.dispatch(this.view.state.tr.delete(codeBlockPos, codeBlockEnd));
    this.view.focus();
  }
  onDelete(e: KeyboardEvent) {
    if (this.node.textContent.length === 0) {
      if (!this.tryDeleting.value) {
        this.tryDeleting.value = true;
      } else {
        this.deleteBlockNode();
        this.tryDeleting.value = false;
      }
    }
  }

  // handleXXEvent 事件说明：
  // 返回 true 表示编辑器不处理该事件，事件处理到此为止。
  // 返回 false 表示交给编辑器继续处理
  handleKeyboardEvent(e: KeyboardEvent) {
    if (e.key === "Backspace") {
      this.onDelete(e);
    }
    return false; // 不拦截事件，交给编辑器继续处理
  }
  handleCopyEvent(e: ClipboardEvent) {
    if (window.getSelection()?.toString() === this.cm.getValue()) {
      const codeContent = this.cm.getValue().replace(/[<>&"]/g, (c: string) => {
        return (
          { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] || ""
        );
      });
      e.clipboardData?.setData(
        "text/html",
        `<meta charset="utf-8"><code_block lang="${this.lang.value}">${codeContent}</code_block>`
      );
      e.preventDefault();
      return true;
    }
    return false;
  }
  handlePasteEvent(e: ClipboardEvent) {
    const domParser = new DOMParser();
    const clipboardDataString = e.clipboardData?.getData("text/html");
    if (clipboardDataString) {
      const codeBlockDOM = domParser.parseFromString(
        clipboardDataString,
        "text/html"
      );
      const maybeCodeBlockElement = codeBlockDOM.body.firstElementChild;
      if (maybeCodeBlockElement?.tagName === "code_block") {
        e.clipboardData?.setData(
          "text/plain",
          maybeCodeBlockElement?.textContent || ""
        );
      }
    }
    return false;
  }
  stopEvent(e: Event) {
    if (e.type.startsWith("key")) {
      return this.handleKeyboardEvent(e as KeyboardEvent);
    } else if (e.type === "copy") {
      return this.handleCopyEvent(e as ClipboardEvent);
    } else if (e.type === "paste") {
      return this.handlePasteEvent(e as ClipboardEvent);
    }
    return true;
  }

  destroy() {
    this.view.dom.removeEventListener("focus", this.onViewFocusEventListner);
  }
}
