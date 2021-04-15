<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center m-lr-10">
    <a-button
      v-for="option in alignOptions"
      :key="option.direction"
      class="bib-editor-menu-item__align-btn"
      :class="{
        active: option.direction === activeAlign
      }"
      type="link"
      @click="toggleAlignFn(option.direction)"
    >
      <template #icon>
        <component :is="option.icon"></component>
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined } from "@ant-design/icons-vue";
import type { EditorInstance } from "../typings";
import { findParentNode } from "prosemirror-utils";

const alignOptions = [
  { direction: "left", icon: AlignLeftOutlined },
  { direction: "center", icon: AlignCenterOutlined },
  { direction: "right", icon: AlignRightOutlined }
]

// @States: 
const editorInstance = inject<EditorInstance>("editorInstance");
const activeAlign = ref<"none" | "left" | "center" | "right">("none");

// @LifeCycles: 
onMounted(() => {
  editorInstance?.onEditorDispatched(() => {
    const { selection } = editorInstance.view.value.state;
    const parentHasAlign = findParentNode(node => !!node.attrs.textAlign)(selection);
    if (parentHasAlign) {
      activeAlign.value = parentHasAlign.node.attrs.textAlign;
    } else {
      if (activeAlign.value !== "none") {
        activeAlign.value = "none";
      }
    }
  });
})

// @Methods: 
const toggleAlignFn = (direction: string) => {
  editorInstance?.toggleAlign(direction);
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__align-btn {
    .menu-btn-common;
  }
}
</style>
