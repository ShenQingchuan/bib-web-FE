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
import { inject, onMounted, Ref } from "vue";
import type { EditorInstance, CanToggleMark } from "@editor/typings";
import us from "underscore";
import { EditorSchema } from "@editor/schemas";
import { shieldYjsTrascationEvent } from "@editor/utils";
import { toggleMarkState, useMarks } from "@editor/composable/useToggleableMarksState";
import { trKeyToggleMark } from "@editor/trKeys";

const props = defineProps<{
  mark: CanToggleMark;
  isActive: boolean;
}>();

const editorInstance = inject<EditorInstance>("editorInstance")!;
const excludes = EditorSchema.marks[props.mark].spec.excludes;
const marksGroup = useMarks()

// @LifeCycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (shieldYjsTrascationEvent(tr)) return;
    if (tr.getMeta('trKey') === trKeyToggleMark) return;

    if (excludes) {
      const storedMarksNames = tr.storedMarks?.map(m => m.type.name);
      for (let ex of excludes.split(" ")) {
        if (storedMarksNames?.includes(ex)) {
          marksGroup[props.mark].isActive.value = false;
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
    marksGroup[props.mark].isActive.value = us.uniq(concated).map(m => m.type.name).includes(props.mark);
  });
});
const toggleFn = () => {
  toggleMarkState(props.mark);
  editorInstance?.toggleMark(props.mark);
  // magic: 由于必须设置 inclusive 属性为 true 保证 Mark 状态下输入连续性
  // 但有了 inclusive 关闭该 Mark 后会仍然显示处于该 Mark 中，但输入后续内容不会再带
  // 所以这里的逻辑是：若之前是 true，click 了一定切为 false 保证按钮高亮正确性
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item__btn {
  .menu-btn-common;
}
</style>
