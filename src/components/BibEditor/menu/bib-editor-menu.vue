<template>
  <div
    class="bib-editor-menu flex-row jyct-center anis-center p-10"
    :class="{
      fixed: props.fixed
    }"
    :style="{
      top
    }"
  >
    <bib-menu-heading />
    <bib-menu-font-size />
    <bib-menu-text-color />
    <bib-menu-text-bg-color />
    <bib-menu-mark
      v-for="item in marksGroup"
      :key="item.mark"
      :mark="item.mark"
      :is-active="item.isActive"
    >
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
import { provide, ref } from "vue";
import { useMarks } from "../composable/useToggleableMarksState";
import Icon from "@ant-design/icons-vue";
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
import type { EditorInstance } from "../typings";

const marksGroup = useMarks();

const props = defineProps<{
  editorInstance: EditorInstance;
  fixed?: boolean;
  top?: string;
}>();
provide("editorInstance", props.editorInstance);

const isInTable = ref(false);
provide('is-bib-editor-table-mode', isInTable);
</script>

<style lang="less">
.bib-editor-menu {
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
