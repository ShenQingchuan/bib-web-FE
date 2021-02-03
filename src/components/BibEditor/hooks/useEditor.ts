import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, Schema, Mark } from "prosemirror-model";
import { buildKeymap } from "prosemirror-example-setup";
import { buildInputRules, buildPasteRules } from "../input-rules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";
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

export function useEditor(options: BibEditorOptions) {
  let editorView = shallowRef({} as EditorView);
  const updateHooks = ref<DispatchHook[]>([]);

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
          hook(tr, hook.meta);
        });
      },
      nodeViews: {
        code_block(node, view, getPos) {
          return new CodeBlockView(node, view, getPos);
        },
      },
    });
  };
  onUnmounted(() => {
    editorView.value.destroy();
  });

  const toJSON = () => {
    return editorView.value.state.doc.toJSON();
  };
  const focus = () => {
    editorView.value.focus();
  };
  const toggle = (markName: EditorToggleCategories) => {
    !editorView.value.hasFocus() && editorView.value.focus();
    toggleMark(EditorSchema.marks[markName])(
      editorView.value.state,
      editorView.value.dispatch
    );
  };
  const onEditorDispatched = (fn: DispatchHook, meta?: Record<string, any>) => {
    fn.meta = meta;
    updateHooks.value.push(fn);
  };

  const editorCompose: EditorComposable = {
    view: editorView,
    toJSON,
    focus,
    toggle,
    onEditorDispatched,
  };

  return {
    initEditor,
    editorCompose,
  };
}
