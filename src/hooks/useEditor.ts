import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, Schema } from "prosemirror-model";
import { buildKeymap } from "prosemirror-example-setup";
import {
  buildInputRules,
  buildPasteRules,
} from "../components/BibEditor/input-rules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { history } from "prosemirror-history";
import CodeBlockView, {
  arrowHandlersInCodeBlock,
} from "../components/BibEditor/code-block-view";
import placeholder from "../components/BibEditor/placeholder";
import {
  BibEditorOptions,
  EditorComposable,
} from "../components/BibEditor/typings";
import { EditorSchema } from "../components/BibEditor/editor-schema";
import { onUnmounted } from "vue";

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
  let editorView = {} as EditorView;

  const initEditor = (el: any) => {
    editorView = new EditorView(el as HTMLDivElement, {
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
      nodeViews: {
        code_block(node, view, getPos) {
          return new CodeBlockView(node, view, getPos);
        },
      },
    });
  };

  onUnmounted(() => {
    editorView.destroy();
  });

  const toJSON = () => {
    return editorView.state.doc.toJSON();
  };
  const focus = () => {
    editorView.focus();
  };

  const editorCompose: EditorComposable = {
    toJSON,
    focus,
  };

  return {
    editorView,
    initEditor,
    editorCompose,
  };
}
