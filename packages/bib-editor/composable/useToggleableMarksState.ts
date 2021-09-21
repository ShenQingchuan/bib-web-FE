import { ref, Ref } from "vue";
import { CanToggleMark } from "@editor/typings";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined
} from "@ant-design/icons-vue";
import CodeMarkIcon from "@editor/icons/code-mark-icon.vue";
import SuperScriptIcon from "@editor/icons/superscript-mark-icon.vue";
import SubScriptIcon from "@editor/icons/subscript-mark-icon.vue";

type MarkCompose = { mark: CanToggleMark; icon: any; isActive: Ref };
const createMarkMenuItem = (mark: CanToggleMark, icon: any) => ({
  mark,
  icon,
  isActive: ref(false)
});
const marksGroup: Record<CanToggleMark, MarkCompose> = {
  strong: createMarkMenuItem("strong", BoldOutlined),
  em: createMarkMenuItem("em", ItalicOutlined),
  u: createMarkMenuItem("u", UnderlineOutlined),
  del: createMarkMenuItem("del", StrikethroughOutlined),
  code: createMarkMenuItem("code", CodeMarkIcon),
  sup: createMarkMenuItem("sup", SuperScriptIcon),
  sub: createMarkMenuItem("sub", SubScriptIcon)
};

/** 可切换 Mark 的响应式状态表 */
export function useMarks() {
  return marksGroup;
}
/** toggle 某个 Mark 的状态 */
export function toggleMarkState(markName: CanToggleMark) {
  marksGroup[markName].isActive.value = !marksGroup[markName].isActive.value;
}
