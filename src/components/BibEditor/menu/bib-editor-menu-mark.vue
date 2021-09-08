<template>
  <div class="bib-editor-menu-item__wrapper m-lr-4" @click="toggleFn">
    <a-button
      class="bib-editor-menu-item__btn"
      :class="{
        active: isActive
      }"
      type="link"
    >
      <template #icon>
        <slot></slot>
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, Ref } from "vue";
import type { EditorInstance, CanToggleMark } from "../typings";
import us from "underscore";
import { EditorSchema } from "../editor-schema";
import { shieldYjsTrascationEvent } from "../utils";

const { isActive, mark: markName } = defineProps<{
  mark: CanToggleMark;
  isActive: Ref<boolean>;
}>();

const editorInstance = inject<EditorInstance>("editorInstance")!;
const toggleTo = ref<"on" | "off">("on");
const needUpdate = ref(false);
const excludes = EditorSchema.marks[markName].spec.excludes;

// @LifeCycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (shieldYjsTrascationEvent(tr)) return;
    if (excludes) {
      const storedMarksNames = tr.storedMarks?.map(m => m.type.name);
      for (let ex of excludes.split(" ")) {
        if (storedMarksNames?.includes(ex)) {
          isActive.value = false;
          return;
        }
      }
    }
    const { $from, $to, empty } = editorInstance.view.state.selection;
    const storedMarks =
      editorInstance.view.state.storedMarks
      || tr.storedMarks
      || [];
    let concated = storedMarks.concat($from.marks());
    if (!empty) concated = concated.concat($to.marks());
    isActive.value = us.uniq(concated).map(m => m.type.name).includes(markName);
  });
});
const toggleFn = () => {
  toggleTo.value = isActive.value ? "off" : "on";
  needUpdate.value = true;
  editorInstance?.toggleMark(markName);
  needUpdate.value = false;
  // magic: 由于必须设置 inclusive 属性为 true 保证 Mark 状态下输入连续性
  // 但有了 inclusive 关闭该 Mark 后会仍然显示处于该 Mark 中，但输入后续内容不会再带
  // 所以这里的逻辑是：若之前是 true，click 了一定切为 false 保证按钮高亮正确性
  if (isActive.value && toggleTo.value === 'off') {
    // 按钮 active 亮着，toggleTo 又确认为要关闭
    isActive.value = false;
  }
}
</script>

<style lang="less" scoped>
@import '@/less/color.less';
@import './menu-btn-common.less';
.bib-editor-menu-item__btn {
  .menu-btn-common;
}
</style>
