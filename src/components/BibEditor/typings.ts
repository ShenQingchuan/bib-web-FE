import { EditorState, Transaction } from "prosemirror-state";
import { Schema, NodeType } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { Ref } from "vue";

export interface BibEditorOptions {
  initContent: string;
  placeholder?: string;
}

export type EditorToggleMethodReturns = (
  state: EditorState<Schema<string, string>>,
  dispatch?: ((tr: Transaction<Schema<string, string>>) => void) | undefined
) => boolean;
export type EditorToggleCategories =
  | "strong"
  | "em"
  | "code"
  | "del"
  | "sub"
  | "sup"
  | "u";

export interface DispatchHook {
  (tr: Transaction, meta?: Record<string, any>): void;
  hookMeta?: Record<string, any>;
}
export interface EditorComposable {
  view: Ref<EditorView>;
  toJSON: () => {
    [key: string]: any;
  };
  focus: () => void;
  toggleHeading: (attrs: { level: number }) => void;
  setBlockType: (nodeType: NodeType, attrs?: any) => void;
  toggleMark: (markName: EditorToggleCategories) => void;
  onEditorDispatched: (fn: DispatchHook, meta?: Record<string, any>) => void;
}
