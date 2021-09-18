<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-dropdown class="bib-editor-menu-item__insert-table-dropdown" v-model:visible="gridVisible">
      <a-button type="link" class="bib-editor-menu-item__insert-table-btn p-lr-4">
        <InsertTable theme="outline" class="bib-editor-menu-item__insert-table-btn-icon" />
      </a-button>
      <template #overlay>
        <div class="flex-col anis-center bib-editor-menu-item__overlay-wrapper p-6">
          <div class="flex-row fs-12 jyct-center anis-center">{{ `插入表格：${rowsCount}×${colsCount}` }}</div>
          <table
            class="bib-editor-menu-item__overlay-grid"
            @mouseleave="rowsCount = 0, colsCount = 0"
            @click="handleClickGrid"
          >
            <tbody>
              <tr v-for="row in 10" :key="row">
                <td @mouseenter="rowsCount = row, colsCount = col" v-for="col in 10" :key="col">
                  <div
                    class="bib-editor-menu-item__overlay-grid-cell"
                    :class="{ 'active': row <= rowsCount && col <= colsCount }"
                  ></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { InsertTable } from '@icon-park/vue-next';
import type { EditorInstance } from '../typings';

// @States:
const gridVisible = ref(false);
const rowsCount = ref(0);
const colsCount = ref(0);
const editorInstance = inject<EditorInstance>('editorInstance');

// @LifeCycels:

// @Methods:
const handleClickGrid = () => {
  editorInstance?.insertTable(rowsCount.value, colsCount.value);
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "@/less/shared.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__insert-table-btn {
    .menu-btn-common;

    &-icon {
      .iconpark-fix;
    }
  }
}

.bib-editor-menu-item__overlay-wrapper {
  background-color: #fff;
  border: 1px solid @N200;

  table.bib-editor-menu-item__overlay-grid {
    border-collapse: separate;

    td {
      width: 23px;
      height: 23px;
      line-height: 23px;
      border: 2px solid #fff;
      background-color: #f7f7f7;

      .bib-editor-menu-item__overlay-grid-cell {
        width: 100%;
        height: 100%;
        border: 1px solid #dcdcdc;

        &.active {
          background-color: @W100;
        }
      }
    }
  }
}
</style>
