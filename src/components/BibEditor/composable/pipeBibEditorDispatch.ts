import { Transaction } from "prosemirror-state";

export default function pipeBibEditorDispatch(
  dispatch: (tr: Transaction<any>) => void,
  tr: Transaction,
  meta?: { [key: string]: any },
  callback?: (tr: Transaction) => void
) {
  if (meta) {
    for (const key in meta) {
      key && tr.setMeta(key, meta[key]);
    }
  }
  callback && callback(tr);
  dispatch(tr);
}
