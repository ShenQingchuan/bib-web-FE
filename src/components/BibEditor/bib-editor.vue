<template>
  <div class="bib-editor" :ref="initEditorRef"></div>
</template>

<script setup lang="ts">
import { defineProps, onUnmounted } from "vue";
import type { EditorComposable } from "./typings";

const props = defineProps<{
  editorCompose: EditorComposable;
  initEditorRef: (el: any) => void
}>();

// 卸载编辑器
onUnmounted(() => {
  props.editorCompose.view.value.destroy();
})
</script>

<style lang="less" scoped>
.bib-editor {
  width: 80vw;
}
</style>
