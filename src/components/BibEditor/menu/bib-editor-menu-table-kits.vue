<template>
  <div class="bib-editor-menu-item__wraper flex-row anis-center p-lr-2">
    <!-- 添加、删除列 -->
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('addColumnBefore')"
    >
      <Icon :component="IconInsertColBefore" />
    </a-button>
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('addColumnAfter')"
    >
      <Icon :component="IconInsertColAfter" />
    </a-button>

    <!-- 添加、删除行 -->
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('addRowBefore')"
    >
      <Icon :component="IconInsertRowBefore" />
    </a-button>
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('addRowAfter')"
    >
      <Icon :component="IconInsertRowAfter" />
    </a-button>

    <!-- 合并、拆分单元格 -->
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('mergeCells')"
    >
      <MergeCells theme="outline" class="iconpark" />
    </a-button>
    <a-button
      type="link"
      class="bib-editor-menu-item__table-kits-btn p-lr-4"
      @click="execTableCommand('splitCell')"
    >
      <SplitCells theme="outline" class="iconpark" />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { MergeCells, SplitCells } from '@icon-park/vue-next';
import Icon from '@ant-design/icons-vue';
import IconInsertColBefore from '../icons/editor__insert-col-after.vue';
import IconInsertColAfter from '../icons/editor__insert-row-after.vue';
import IconInsertRowBefore from '../icons/editor__insert-row-before.vue';
import IconInsertRowAfter from '../icons/editor__insert-col-before.vue';
import type { EditorComposable, TableCommand } from '../typings';

// @States:
const editorCompose = inject<EditorComposable>('editorCompose');

// @LifeCycels:

// @Methods:
const execTableCommand = (cmdName: TableCommand) => {
  editorCompose?.execTableCommand(cmdName);
}
</script>

<style lang="less" scoped>
@import "../../../less/color.less";
@import "../../../less/shared.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item {
  &__table-kits-btn {
    .menu-btn-common;
  }
}
</style>
