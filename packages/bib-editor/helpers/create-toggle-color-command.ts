import { EditorView } from "prosemirror-view";
import { MarkType } from "prosemirror-model";

// inner helper: 创建切换颜色的 Command，分别用于文字颜色和高亮颜色
export const createToggleColorCommand = (
  view: EditorView,
  markType: MarkType,
  trKey: string
) => {
  return (color: string) => {
    const { state, dispatch } = view;
    const { selection, tr } = state;
    const { from, to, empty } = selection;

    const colorMark = markType.create({
      color
    });
    // 是选区状态
    if (!empty) {
      tr.addMark(from, to, colorMark);
    }
    // 是光标状态
    else {
      tr.addStoredMark(colorMark);
    }

    tr.setMeta("trKey", trKey);
    dispatch(tr);
  };
};
