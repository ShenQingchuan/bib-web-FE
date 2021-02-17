<template>
  <div class="flex-row anis-center p-10">
    <bib-menu-header />
    <bib-menu-mark
      v-for="item in marksGroup"
      :key="item.mark"
      :mark="item.mark"
    >
      <Icon :component="item.icon" />
    </bib-menu-mark>
    <bib-menu-align />
    <bib-menu-list />
  </div>
</template>

<script setup lang="ts">
import { defineProps, provide } from "vue";
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from "@ant-design/icons-vue";
import Icon from "@ant-design/icons-vue";
import CodeMarkIcon from "../mark-icons/code-mark-icon.vue";
import SuperScriptIcon from "../mark-icons/superscript-mark-icon.vue";
import SubScriptIcon from "../mark-icons/subscript-mark-icon.vue";
import BibMenuMark from "./bib-editor-menu-mark.vue";
import BibMenuHeader from "./bib-editor-menu-heading.vue";
import BibMenuAlign from "./bib-editor-menu-align.vue";
import BibMenuList from './bib-editor-menu-list.vue';
import type { EditorToggleCategories, EditorComposable } from "../typings";

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
