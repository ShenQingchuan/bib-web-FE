<template>
  <div
    class="bib-editor-menu-item__wrapper m-lr-4"
    :class="{
      active: isActive
    }"
    @click="toggleFn"
  >
    <a-button class="bib-editor-menu-item__btn" type="link">
      <template #icon>
        <slot></slot>
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject, defineProps, ref, onMounted } from "vue";
import type { EditorComposable, EditorToggleCategories } from "../typings";
import * as us from "underscore";
import { EditorSchema } from "../editor-schema";

const props = defineProps<{
  mark: EditorToggleCategories;
}>();

const isActive = ref(false);
const editorCompose = inject<EditorComposable>("editorCompose");
const toggleTo = ref<"on" | "off">("on");
const needUpdate = ref(false);
const excludes = EditorSchema.marks[props.mark].spec.excludes;

// @LifeCycles:
onMounted(() => {
  editorCompose?.onEditorDispatched((tr, meta) => {
    if (excludes) {
      const storedMarksNames = tr.storedMarks?.map(m => m.type.name);
      for (let ex of excludes.split(" ")) {
        if (storedMarksNames?.includes(ex)) {
          isActive.value = false;
          return;
        }
      }
    }
    if (meta?.needUpdate?.value || tr.selectionSet) {
      const { $from, $to, empty } = editorCompose.view.value.state.selection;
      const storedMarks =
        editorCompose.view.value.state.storedMarks
        || tr.storedMarks
        || [];
      let concated = storedMarks.concat($from.marks());
      if (!empty) concated = concated.concat($to.marks());
      isActive.value = us.uniq(concated).map(m => m.type.name).includes(props.mark);
    }
  }, {
    $needUpdate: needUpdate
  })
});
const toggleFn = () => {
  toggleTo.value = isActive.value ? "off" : "on";
  needUpdate.value = true;
  editorCompose?.toggleMark(props.mark);
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
@import "../../../less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item__btn {
  .menu-btn-common;
}
</style>
