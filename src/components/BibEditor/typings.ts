import { EditorState, Transaction } from "prosemirror-state";
import { Schema } from "prosemirror-model";
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
  meta?: Record<string, any>;
}
export interface EditorComposable {
  view: Ref<EditorView>;
  toJSON: () => {
    [key: string]: any;
  };
  focus: () => void;
  toggle: (markName: EditorToggleCategories) => void;
  onEditorDispatched: (fn: DispatchHook, meta?: Record<string, any>) => void;
}
