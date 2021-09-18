import { EditorState } from "prosemirror-state";
import { NodeType, Node } from "prosemirror-model";
import { tableNodeTypes } from "prosemirror-tables";

export interface CreateTableArgs {
  rowsCount: number;
  colsCount: number;
  withHeaderRow?: boolean;
  cellContent?: any;
}

export default function createTable(
  state: EditorState,
  rowsCount: number,
  colsCount: number,
  withHeaderRow?: boolean,
  cellContent?: any
): Node {
  const types = tableNodeTypes(state.schema);
  const headerCells = [];
  const cells = [];
  const createCell = (cellType: NodeType, cellContent: any) =>
    cellContent
      ? cellType.createChecked(null, cellContent)
      : cellType.createAndFill();

  for (let index = 0; index < colsCount; index += 1) {
    const cell = createCell(types.cell, cellContent);

    if (cell) {
      cells.push(cell);
    }

    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, cellContent);

      if (headerCell) {
        headerCells.push(headerCell);
      }
    }
  }

  const rows = [];

  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(
      types.row.createChecked(
        null,
        withHeaderRow && index === 0 ? headerCells : cells
      )
    );
  }

  return types.table.createChecked(null, rows);
}
