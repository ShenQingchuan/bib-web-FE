import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, NodeType, Schema } from "prosemirror-model";
import { buildKeymap } from "prosemirror-example-setup";
import { buildInputRules, buildPasteRules } from "../input-rules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, setBlockType, toggleMark } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { history } from "prosemirror-history";
import CodeBlockView, { arrowHandlersInCodeBlock } from "../code-block-view";
import placeholder from "../placeholder";
import {
  BibEditorOptions,
  DispatchHook,
  EditorComposable,
  EditorToggleCategories,
} from "../typings";
import { EditorSchema } from "../editor-schema";
import { onUnmounted, shallowRef, ref } from "vue";

const sampleInitDocJSON = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      text: "",
    },
  ],
};
function createInitDoc(schema: Schema, initContent: string) {
  try {
    const parseFromOptions = JSON.parse(initContent);
    const doc = Node.fromJSON(schema, parseFromOptions);
    return doc;
  } catch (err) {
    return Node.fromJSON(schema, sampleInitDocJSON);
  }
}

function useDispatchWithMeta(
  view: EditorView,
  tr: Transaction,
  key?: string,
  meta?: any
) {
  key && tr.setMeta(key, meta);
  return view.dispatch(tr);
}
export const trKeyMark = (markName: string) => `tr-mark-${markName}`;
export const trKeyHeading = `tr-heading`;

export function useEditor(options: BibEditorOptions) {
  let editorView = shallowRef({} as EditorView);
  const updateHooks = ref<DispatchHook[]>([]);

  /** 通过 ref hook 初始化 EditorView */
  const initEditor = (el: any) => {
    editorView.value = new EditorView(el as HTMLDivElement, {
      state: EditorState.create({
        doc: createInitDoc(EditorSchema, options.initContent),
        plugins: [
          history(),
          keymap(buildKeymap(EditorSchema)),
          buildInputRules(EditorSchema),
          ...buildPasteRules(EditorSchema),
          keymap(baseKeymap),
          dropCursor(),
          gapCursor(),
          arrowHandlersInCodeBlock,
          placeholder(options.placeholder || "写点什么吧 ..."),
        ],
      }),
      dispatchTransaction(tr) {
        const newState = editorView.value.state.apply(tr);
        editorView.value.updateState(newState);
        updateHooks.value.forEach((hook) => {
          hook(tr, hook.hookMeta);
        });
      },
      nodeViews: {
        code_block(node, view, getPos) {
          return new CodeBlockView(node, view, getPos);
        },
      },
    });
  };

  /** 卸载 EditorView */
  onUnmounted(() => {
    editorView.value.destroy();
  });

  /** 将文档 doc 输出为 JSON 字符串 */
  const toJSON = () => {
    return editorView.value.state.doc.toJSON();
  };

  /** 聚焦该编辑器 */
  const focus = () => {
    editorView.value.focus();
  };

  /** 切换 mark */
  const _toggleMark = (markName: EditorToggleCategories) => {
    !editorView.value.hasFocus() && editorView.value.focus();
    const trKey = trKeyMark(markName);
    toggleMark(EditorSchema.marks[markName])(editorView.value.state, (tr) =>
      useDispatchWithMeta(editorView.value, tr, "trKey", trKey)
    );
  };

  /** 切换 标题级别 */
  const toggleHeading = (attrs: { level: number }) => {
    !editorView.value.hasFocus() && editorView.value.focus();
    const trKey = trKeyHeading;
    setBlockType(EditorSchema.nodes.heading, attrs)(
      editorView.value.state,
      (tr) => useDispatchWithMeta(editorView.value, tr, "trKey", trKey)
    );
  };

  /** 设置块类型 */
  const _setBlockType = (nodeType: NodeType, attrs?: any) => {
    !editorView.value.hasFocus() && editorView.value.focus();
    setBlockType(nodeType, attrs)(
      editorView.value.state,
      editorView.value.dispatch
    );
  };

  /** 注册 Dispatch 回调钩子 */
  const onEditorDispatched = (fn: DispatchHook, meta?: Record<string, any>) => {
    fn.hookMeta = meta;
    updateHooks.value.push(fn);
  };

  const editorCompose: EditorComposable = {
    view: editorView,
    toggleHeading,
    toggleMark: _toggleMark,
    setBlockType: _setBlockType,
    toJSON,
    focus,
    onEditorDispatched,
  };

  return {
    initEditor,
    editorCompose,
  };
}
