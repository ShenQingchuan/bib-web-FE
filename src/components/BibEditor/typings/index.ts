import { EditorState, Transaction } from 'prosemirror-state';
import { Node, Schema, NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { Ref } from 'vue';
import { UserTokenPayload } from '@/utils/user-token-validation';

export interface BibEditorOptions {
  docName: string;
  credential: UserTokenPayload; // Bib 编辑器默认协同，要求必须提供用户凭证
  placeholder?: string;
  readonly?: boolean;
  contentForViewRender?: string;
  onViewCreated?: (view: EditorView) => void;
}

export type EditorToggleMethodReturns = (
  state: EditorState<Schema<string, string>>,
  dispatch?: ((tr: Transaction<Schema<string, string>>) => void) | undefined
) => boolean;
export type CanToggleMark =
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
export interface EditorInstance {
  view: EditorView;
  dispatchHooks: DispatchHook[];
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
  toggleMark: (markName: CanToggleMark) => void;
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
  quitEditor: (callback?: (...innerArgs: any[]) => void, ...args: any[]) => void;
}

export interface EditorCompose {
  initEditor: (el: any) => EditorInstance;
  onlineOtherUsers: Ref<OnlineUser[]>;
  cursorColor: Ref<string>;
}

export interface MarkMenuItem {
  mark: CanToggleMark;
  icon: any;
  isActive: boolean;
};

export type InsertImageType = 'local' | 'online';

export interface OnlineUser {
  userId: number;
  userName: string;
  avatarURL: string;
  color: string;
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
