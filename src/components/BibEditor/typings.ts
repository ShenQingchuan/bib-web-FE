export interface BibEditorOptions {
  initContent: string;
  placeholder?: string;
}
export interface EditorComposable {
  toJSON: () => {
    [key: string]: any;
  };
  focus: () => void;
}
