import { Ref, ref, createApp, watch } from "vue";
import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { exitCode } from "prosemirror-commands";
import { undo, redo } from "y-prosemirror";
import CodeMirror from "codemirror";
import {
  EditorState,
  Selection,
  TextSelection,
  Transaction,
} from "prosemirror-state";
import { EditorSchema } from "../editor-schema";
import { keymap } from "prosemirror-keymap";
import { omit } from "underscore";
import CodeBlockLangSwitcher from "@/components/BibEditor/components/code-block-lang-switcher.vue";

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
      let side = dir == "left" || dir == "up" ? -1 : 1,
        $head = state.selection.$head;
      let nextPos = Selection.near(
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
  dart: "dart",
  "": "text/plain",
};
const langSimplify: Record<string, string> = {
  cpp: "c++",
  csharp: "c#",
  js: "javascript",
  ts: "typescript",
  objc: "objective-c",
  py: "python",
};
export const supportLangs: Array<string> = Object.keys(omit(MIMEMap));
export const MIMEReflect = (lang?: keyof typeof MIMEMap) =>
  lang ? MIMEMap[lang] || "" : "";

export const arrowHandlersInCodeBlock = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down"),
});

export default class CodeBlockView {
  dom: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: any;
  incomingChanges: boolean;
  cm: CodeMirror.Editor;
  lang: Ref<keyof typeof MIMEMap>;
  updating: boolean;
  langSwitcher: HTMLElement;
  tryDeleting: boolean;

  constructor(node: Node, view: EditorView, getPos: (() => number) | boolean) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.incomingChanges = false;
    const langAttr = node.attrs.lang;
    this.lang = ref<keyof typeof MIMEMap>(
      langAttr ? langSimplify[langAttr] || langAttr : ""
    );
    this.tryDeleting = false;

    // 新建一个 CodeMirror 实例
    this.cm = CodeMirror(null as any, {
      value: this.node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap(),
      mode: MIMEReflect(this.lang.value),
      scrollbarStyle: "null",
      viewportMargin: Infinity,
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
    this.cm.on("focus", () => this.forwardSelection());

    // 在 code block 右上角显示一个用来表示语法模式的标签
    const ls = document.createElement("div");
    createApp(CodeBlockLangSwitcher, {
      lang: this.lang.value,
      setLangSpec: (s: string) => {
        this.lang.value = s as any;
      },
    }).mount(ls);
    watch(this.lang, (newValue) => {
      this.cm.setOption("mode", MIMEReflect(newValue));
    });
    this.langSwitcher = ls;
    this.dom.appendChild(this.langSwitcher);
  }

  forwardSelection() {
    if (!this.cm.hasFocus()) return;
    let state = this.view.state;
    let selection = this.asProseMirrorSelection(state.doc);
    if (!selection.eq(state.selection))
      this.view.dispatch(state.tr.setSelection(selection));
  }
  asProseMirrorSelection(doc: Node) {
    let offset = this.getPos() + 1;
    let anchor = this.cm.indexFromPos(this.cm.getCursor("anchor")) + offset;
    let head = this.cm.indexFromPos(this.cm.getCursor("head")) + offset;
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
    let change = computeChange(this.node.textContent, this.cm.getValue());
    if (change) {
      let start = this.getPos() + 1;
      let tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? EditorSchema.text(change.text) : (null as any)
      );
      this.view.dispatch(tr);
    }
  }
  codeMirrorKeymap() {
    let view = this.view;
    let mod = /Mac/.test(navigator.platform) ? "Cmd" : "Ctrl";
    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape("line", -1),
      Left: () => this.maybeEscape("char", -1),
      Down: () => this.maybeEscape("line", 1),
      Right: () => this.maybeEscape("char", 1),
      [`${mod}-Enter`]: (instance) => {
        if (exitCode(view.state, view.dispatch)) view.focus();
      },
      [`${mod}-Z`]: () => undo(view.state),
      [`Shift-${mod}-Z`]: () => redo(view.state),
      [`${mod}-Y`]: () => redo(view.state),
    });
  }
  maybeEscape(unit: string, dir: number) {
    let pos = this.cm.getCursor();
    if (
      this.cm.somethingSelected() ||
      pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit === "char" &&
        pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    )
      return CodeMirror.Pass;
    this.view.focus();
    let targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
    let selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
    this.view.dispatch(
      this.view.state.tr.setSelection(selection).scrollIntoView()
    );
    this.view.focus();
  }
  update(node: Node) {
    if (node.type != this.node.type) return false;
    this.node = node;
    let change = computeChange(this.cm.getValue(), node.textContent);
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
  onDelete() {
    if (this.node.textContent.length === 0) {
      if (!this.tryDeleting) {
        this.tryDeleting = true; // 刚刚全部删除时留一个可以再编辑的机会
      } else {
        this.view.dispatch(
          this.view.state.tr.delete(this.getPos(), this.getPos() + 1)
        );
        this.view.focus();
        this.tryDeleting = false;
      }
    }
  }

  // handleXXEvent 事件说明：
  // 返回 true 表示编辑器不处理该事件，事件处理到此为止。
  // 返回 false 表示交给编辑器继续处理
  handleKeyboardEvent(e: KeyboardEvent) {
    if (e.key === "Backspace") {
      this.onDelete();
    }
    return false; // 交给编辑器执行删除动作
  }
  handleCopyEvent(e: ClipboardEvent) {
    const codeContent = this.cm.getValue();
    e.clipboardData?.setData(
      "text/html",
      `<meta charset="utf-8"><code_block lang="${this.lang.value}">${codeContent}</code_block>`
    );
    e.preventDefault();
    return true;
  }
  stopEvent(e: Event) {
    console.log("[tmy e ]", e.type);
    if (e.type.startsWith("key")) {
      return this.handleKeyboardEvent(e as KeyboardEvent);
    } else if (e.type === "copy") {
      return this.handleCopyEvent(e as ClipboardEvent);
    }
    // 其他情况下只要 tryDeleting 曾被置为过 true，
    // 都降回到 false
    this.tryDeleting = false;
    return true;
  }
}
