<template>
  <div class="flex-row anis-center p-10">
    <!-- 加粗 -->
    <bib-menu-item mark="strong">
      <BoldOutlined />
    </bib-menu-item>
    <!-- 斜体 -->
    <bib-menu-item mark="em">
      <ItalicOutlined />
    </bib-menu-item>
    <!-- 删除线 -->
    <bib-menu-item mark="del">
      <StrikethroughOutlined />
    </bib-menu-item>
    <!-- 下划线 -->
    <bib-menu-item mark="u">
      <UnderlineOutlined />
    </bib-menu-item>
    <!-- 行内代码 -->
    <bib-menu-item mark="code">
      <Icon :component="CodeMarkIcon"></Icon>
    </bib-menu-item>
  </div>
</template>

<script setup lang="ts">
import { defineProps, provide } from "vue";
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined, CodeOutlined } from "@ant-design/icons-vue";
import Icon from "@ant-design/icons-vue";
import CodeMarkIcon from "./code-mark-icon.vue";
import BibMenuItem from "./bib-editor-menu-item.vue";
import type { EditorComposable } from "./typings";

const props = defineProps<{
  editorCompose: EditorComposable;
}>();
provide("editorCompose", props.editorCompose);
</script>

<style lang="less" scoped>
</style>
