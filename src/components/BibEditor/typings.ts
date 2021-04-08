import { EditorState, Transaction } from 'prosemirror-state';
import { Node, Schema, NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { Ref } from 'vue';
import { UserTokenPayload } from 'utils/user-token-validation';

export interface BibEditorOptions {
  initContent: string;
  docName: string;
  credential: UserTokenPayload; // Bib 编辑器默认协同，要求必须提供用户凭证
  placeholder?: string;
  readonly?: boolean;
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
  options: BibEditorOptions;
  toJSON: () => {
    [key: string]: any;
  };
  focus: () => void;
  toggleHeading: (attrs: { level: number }) => void;
  toggleFontSize: (size: number) => void;
  toggleAlign: (direction: string) => void;
  updateIndent: (t: '+' | '-') => void;
  toggleList: (listType: NodeType, itemTyp: NodeType) => void;
  toggleMark: (markName: EditorToggleCategories) => void;
  toggleTextColor: (color: string) => void;
  toggleTextBgColor: (color: string) => void;
  toggleQuoteBlock: () => void;
  insertHorizontalRuleLine: () => void;
  insertImage: (insertType: InsertImageType) => void;
  insertVideo: (icon: string, label: string) => void;
  insertTable: (rowsCount: number, colsCount: number) => void;
  execTableCommand: (cmdName: TableCommand) => void;
  onEditorDispatched: (fn: DispatchHook, meta?: Record<string, any>) => void;
  applyForNodesAtCursor: (fn: (node: Node, pos: number) => void) => void;
}

export type InsertImageType = 'local' | 'online';

export interface OnlineUser {
  userId: number;
  userName: string;
}

export interface DocContentElement {
  type: string;
  attrs?: Record<string, any>;
  content?: DocContentElement[];
}

export interface DocHeading extends DocContentElement {
  attrs: {
    level: number;
    [key: string]: any;
  };
  content: [{ type: 'text'; text: string }];
}

export interface DocTableOfContentsUnit {
  title: string;
  level: number;
  children: DocTableOfContentsUnit[];
}

export type TableCommand =
  | 'addColumnBefore'
  | 'addColumnAfter'
  | 'deleteColumn'
  | 'addRowBefore'
  | 'addRowAfter'
  | 'deleteRow'
  | 'mergeCells'
  | 'splitCell';
