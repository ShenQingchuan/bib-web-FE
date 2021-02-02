<template>
  <div class="flex-row anis-center p-10">
    <bib-menu-mark-item v-for="item in marksGroup" :key="item.mark" :mark="item.mark">
      <Icon :component="item.icon" />
    </bib-menu-mark-item>
  </div>
</template>

<script setup lang="ts">
import { defineProps, provide } from "vue";
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from "@ant-design/icons-vue";
import Icon from "@ant-design/icons-vue";
import CodeMarkIcon from "./mark-icons/code-mark-icon.vue";
import SuperScriptIcon from "./mark-icons/superscript-mark-icon.vue";
import SubScriptIcon from "./mark-icons/subscript-mark-icon.vue";
import BibMenuMarkItem from "./bib-editor-menu-mark-item.vue";
import type { EditorToggleCategories, EditorComposable } from "./typings";

const createMarkMenuItem = (mark: EditorToggleCategories, icon: any) => ({ mark, icon });
const marksGroup = [
  createMarkMenuItem("strong", BoldOutlined),
  createMarkMenuItem("em", ItalicOutlined),
  createMarkMenuItem("u", UnderlineOutlined),
  createMarkMenuItem("del", StrikethroughOutlined),
  createMarkMenuItem("code", CodeMarkIcon),
  createMarkMenuItem("sup", SuperScriptIcon),
  createMarkMenuItem("sub", SubScriptIcon),
]

const props = defineProps<{
  editorCompose: EditorComposable;
}>();
provide("editorCompose", props.editorCompose);
</script>

<style lang="less" scoped>
</style>
