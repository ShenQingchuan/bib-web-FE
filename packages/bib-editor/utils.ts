import { Transaction } from "prosemirror-state";

const yjsEventNames = ["yjs-cursor$", "y-sync$"];

/** 屏蔽 Yjs 的改动事件 */
export function shieldYjsTrascationEvent(tr: Transaction) {
  // 命中守卫规则，返回给外部 true 表示确认失败
  return yjsEventNames.some(eventName => !!tr.getMeta(eventName));
}
