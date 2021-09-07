import { Transaction } from "prosemirror-state";

const yjsEventNames = [
  'yjs-cursor$',
  'y-sync$',
]
export function guardYjsTrascationEvent(tr: Transaction) {
  for (const eventName of yjsEventNames) {
    if (tr.getMeta(eventName)) return true;
    // 命中守卫规则，返回给外部 true 表示确认失败
  }
  return false;
}