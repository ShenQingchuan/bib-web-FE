import { Command, toggleMark as _tm } from "prosemirror-commands"
import { Transaction } from "prosemirror-state";
import { EditorSchema } from "@editor/schemas";
import type { CanToggleMark } from "@editor/typings";
import { pipeBibEditorDispatch } from "@editor/utils";

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