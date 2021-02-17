import { EditorState, Transaction } from 'prosemirror-state';
import { Node, Schema, NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { Ref } from 'vue';

export interface BibEditorOptions {
  initContent: string;
  placeholder?: string;
}

export type EditorToggleMethodReturns = (
  state: EditorState<Schema<string, string>>,
  dispatch?: ((tr: Transaction<Schema<string, string>>) => void) | undefined
) => boolean;
export type EditorToggleCategories =
  | 'strong'
  | 'em'
  | 'code'
  | 'del'
  | 'sub'
  | 'sup'
  | 'u';

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
  toggleAlign: (direction: string) => void;
  toggleList: (listType: NodeType, itemType: NodeType) => void;
  toggleMark: (markName: EditorToggleCategories) => void;
  onEditorDispatched: (fn: DispatchHook, meta?: Record<string, any>) => void;
  applyForNodesAtCursor: (fn: (node: Node, pos: number) => void) => void;
}
