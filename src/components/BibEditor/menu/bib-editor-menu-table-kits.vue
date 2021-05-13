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
import { inject, onMounted } from 'vue';
import { MergeCells, SplitCells } from '@icon-park/vue-next';
import { EditorSchema } from "../editor-schema";
import Icon from '@ant-design/icons-vue';
import IconInsertColBefore from '../icons/editor__insert-col-after.vue';
import IconInsertColAfter from '../icons/editor__insert-row-after.vue';
import IconInsertRowBefore from '../icons/editor__insert-row-before.vue';
import IconInsertRowAfter from '../icons/editor__insert-col-before.vue';
import * as pmutils from 'prosemirror-utils';
import type { EditorInstance, TableCommand } from '../typings';
import type { Ref } from 'vue';

// @States:
const editorInstance = inject<EditorInstance>('editorInstance')!;
const isBibEditorTableMode = inject<Ref<boolean>>('is-bib-editor-table-mode')!;

// @LifeCycels:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    const isInTable = !!pmutils.findParentNode((node) => [
      EditorSchema.nodes.table,
      EditorSchema.nodes.table_row,
      EditorSchema.nodes.table_cell,
      EditorSchema.nodes.table_header
    ].includes(node.type))(tr.selection);
    if (isInTable !== isBibEditorTableMode.value) {
      isBibEditorTableMode.value = isInTable;
    }
  });
})

// @Methods:
const execTableCommand = (cmdName: TableCommand) => {
  editorInstance?.execTableCommand(cmdName);
}
</script>

<style lang="less" scoped>
@import '@/less/color.less';
@import '@/less/shared.less';
@import './menu-btn-common.less';

.bib-editor-menu-item {
  &__table-kits-btn {
    .menu-btn-common;
  }
}
</style>
