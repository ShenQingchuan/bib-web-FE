import { TableCommand } from "@editor/typings";

import {
  addColumnAfter,
  addColumnBefore,
  deleteColumn,
  addRowAfter,
  addRowBefore,
  deleteRow,
  mergeCells,
  splitCell,
  setCellAttr,
  deleteTable
} from "prosemirror-tables";
import { EditorState, Transaction } from "prosemirror-state";

const tableToolkits = {
  addColumnAfter,
  addColumnBefore,
  deleteColumn,
  addRowAfter,
  addRowBefore,
  deleteRow,
  mergeCells,
  splitCell,
  setCellAttr,
  deleteTable
};

/** 表格工具命令 */
export const execTableCommand = (
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  cmdName: TableCommand
) => {
  tableToolkits[cmdName](state, dispatch);
};
