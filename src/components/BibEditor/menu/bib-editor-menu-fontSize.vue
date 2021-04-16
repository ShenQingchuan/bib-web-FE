<template>
  <div class="bib-editor-menu-item__wrapper p-t-2 m-lr-10">
    <a-dropdown>
      <a
        class="flex-row anis-center bib-editor-menu-item__font-size m-r-10"
        @click="(e) => e.preventDefault()"
      >
        <div class="text m-r-10">{{ fontSizeDisplay }}px</div>
        <CaretDownOutlined></CaretDownOutlined>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item
            v-for="size in fontSizePoints"
            :key="size"
            class="m-tb-2"
            @click="toggleFontSize(size)"
          >
            <CheckOutlined v-if="fontSizeDisplay === size" />
            <span class="fs-12 p-tb-6">{{ size }}px</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { CaretDownOutlined, CheckOutlined } from "@ant-design/icons-vue";
import { EditorSchema } from "../editor-schema"
import type { EditorInstance } from "../typings";

const fontSizePoints = [12, 13, 14, 15, 16, 19, 22, 24, 29, 32, 40, 48];
const fsMarkType = EditorSchema.marks.fontSizeMark;
const defaultFontSize = 14;

// @States:
const fontSizeDisplay = ref(defaultFontSize);
const editorInstance = inject<EditorInstance>("editorInstance")!;

// @LifeCycels:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    editorInstance.applyForNodesAtCursor((node) => {
      if (node.isText) {
        if (node.marks.map(m => m.type).includes(fsMarkType)) {
          const mark = node.marks.find(m => m.type === fsMarkType)!;
          fontSizeDisplay.value = mark.attrs.size;
        } else if (tr.storedMarks?.map(m => m.type).includes(fsMarkType)) {
          const mark = tr.storedMarks?.find(m => m.type === fsMarkType)!;
          fontSizeDisplay.value = mark.attrs.size;
        } else {
          fontSizeDisplay.value = defaultFontSize;
        }
      }
    })
  })
})

// @Methods:
const toggleFontSize = (size: number) => {
  editorInstance?.toggleFontSize(size);
  fontSizeDisplay.value = size;
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
.bib-editor-menu-item {
  &__font-size {
    &,
    & .text {
      color: @N600;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
