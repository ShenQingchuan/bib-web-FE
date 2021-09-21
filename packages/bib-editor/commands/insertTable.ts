import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { createTable, CreateTableArgs } from "@editor/helpers";
import { trKeyInsertTable } from "@editor/trKeys";

const insertTableCommand = ({
  rowsCount,
  colsCount,
  withHeaderRow,
  cellContent
}: CreateTableArgs) => (
  state: EditorState,
  dispatch: (tr: Transaction) => void
) => {
  const offset = state.tr.selection.anchor + 1;

  const nodes = createTable(
    state,
    rowsCount,
    colsCount,
    withHeaderRow,
    cellContent
  );
  const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
  const resolvedPos = tr.doc.resolve(offset);

  tr.setSelection(TextSelection.near(resolvedPos));
  tr.setMeta("trKey", trKeyInsertTable);
  dispatch(tr);
};

export { insertTableCommand };
