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
    <bib-menu-indent />
    <bib-menu-list />

    <bib-menu-link />
    <bib-menu-quote />
    <bib-menu-hr />

    <bib-menu-insert-table v-show="!isInTable" />
    <!-- 表格专用工具 -->
    <bib-menu-table-kits v-show="isInTable" />

    <bib-menu-insert-image />
    <bib-menu-video />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, provide, ref } from "vue";
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from "@ant-design/icons-vue";
import * as pmutils from 'prosemirror-utils';
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
import BibMenuVideo from './bib-editor-menu-video.vue';
import BibMenuInsertTable from './bib-editor-menu-insert-table.vue';
import BibMenuTableKits from './bib-editor-menu-table-kits.vue';
import type { EditorToggleCategories, EditorComposable } from "../typings";
import { EditorSchema } from "../editor-schema";

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

const isInTable = ref(false);

onMounted(() => {
  props.editorCompose.onEditorDispatched((tr) => {
    isInTable.value = !!pmutils.findParentNode((node) => [
      EditorSchema.nodes.table,
      EditorSchema.nodes.table_row,
      EditorSchema.nodes.table_cell,
      EditorSchema.nodes.table_header
    ].includes(node.type))(tr.selection);
  });
})
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
