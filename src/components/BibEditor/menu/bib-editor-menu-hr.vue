<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button class="bib-editor-menu-item__hr-btn p-lr-4" type="link" @click="insertHrLine">
      <MinusOutlined />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { MinusOutlined } from "@ant-design/icons-vue";
import type { EditorInstance } from "../typings";

// @States:
const editorInstance = inject<EditorInstance>("editorInstance");

// @Methods:
const insertHrLine = () => {
  editorInstance?.insertHorizontalRuleLine();
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item {
  &__hr-btn {
    .menu-btn-common;
  }
}
</style>