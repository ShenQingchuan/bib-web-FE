import { Command, toggleMark as _tm } from "prosemirror-commands"
import { Transaction } from "prosemirror-state";
import pipeBibEditorDispatch from "../composable/pipeBibEditorDispatch";
import { EditorSchema } from "../editor-schema";
import type { CanToggleMark } from "../typings";

const toggleMark: (
  markType: CanToggleMark,
  meta?: { [key: string]: any },
  callback?: (tr: Transaction) => void
) => Command = (markType, meta, callback) => (state, dispatch) => {
  return _tm(EditorSchema.marks[markType])(state, (tr) => {
    if (dispatch) {
      pipeBibEditorDispatch(dispatch, tr, meta, callback);
    }
  });
}
export { toggleMark };