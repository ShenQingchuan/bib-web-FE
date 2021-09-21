import { Transaction } from "prosemirror-state";

const yjsEventNames = ["yjs-cursor$", "y-sync$"];

/** 屏蔽 Yjs 的改动事件 */
export function shieldYjsTrascationEvent(tr: Transaction) {
  // 命中守卫规则，返回给外部 true 表示确认失败
  return yjsEventNames.some(eventName => !!tr.getMeta(eventName));
}

export function pipeBibEditorDispatch(
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
