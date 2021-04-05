<template>
  <div class="bib-menu flex-row jyct-center anis-center p-10" :class="{
    fixed: props.fixed
  }">
    <bib-menu-heading />
    <bib-menu-font-size />
    <bib-menu-text-color />
    <bib-menu-text-bg-color />
    <bib-menu-mark v-for="item in marksGroup" :key="item.mark" :mark="item.mark">
      <Icon :component="item.icon" />
    </bib-menu-mark>
    <bib-menu-align />
    <bib-menu-list />
    <bib-menu-link />
    <bib-menu-quote />
    <bib-menu-hr />
    <bib-menu-insert-image />
    <bib-menu-indent />
  </div>
</template>

<script setup lang="ts">
import { defineProps, provide } from "vue";
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from "@ant-design/icons-vue";
import Icon from "@ant-design/icons-vue";
import CodeMarkIcon from "../icons/code-mark-icon.vue";
import SuperScriptIcon from "../icons/superscript-mark-icon.vue";
import SubScriptIcon from "../icons/subscript-mark-icon.vue";
import BibMenuMark from "./bib-editor-menu-mark.vue";
import BibMenuHeading from "./bib-editor-menu-heading.vue";
import BibMenuFontSize from './bib-editor-menu-fontSize.vue';
import BibMenuAlign from "./bib-editor-menu-align.vue";
import BibMenuList from './bib-editor-menu-list.vue';
import BibMenuTextColor from './bib-editor-menu-text-color.vue';
import BibMenuTextBgColor from "./bib-editor-menu-textbg-color.vue";
import BibMenuLink from "./bib-editor-menu-link.vue";
import BibMenuQuote from "./bib-editor-menu-quote.vue";
import BibMenuHr from "./bib-editor-menu-hr.vue";
import BibMenuInsertImage from './bib-editor-menu-image.vue';
import BibMenuIndent from './bib-editor-menu-indent.vue';
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
  fixed?: boolean
}>();
provide("editorCompose", props.editorCompose);
</script>

<style lang="less">
.bib-menu {
  white-space: nowrap;
  overflow: auto;
  background-color: #fff;

  &.fixed {
    box-shadow: 0 2px 8px #73737314;
    background-color: #fff;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 99;
  }
}
</style>
