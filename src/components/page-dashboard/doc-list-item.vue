<template>
  <div class="dashboard-page__doc-list-item flex-row anis-center p-tb-14 p-lr-10">
    <img src="/assets/svg/dashboard__doc-icon.svg" width="24" height="24" />
    <a
      class="dashboard-page__doc-list-item-title m-l-24 fs-14"
      :href="`/doc/${docItem.id}`"
    >{{ docItem.title }}</a>
    <a-tooltip placement="top" title="编辑" v-if="docItem.editable">
      <img
        src="/assets/svg/dashboard__doc-edit.svg"
        alt="doc-edit"
        class="dashboard-page__doc-list-item-edit-icon m-l-12"
        @click="$router.push(`/doc/${docItem.id}/edit`)"
      />
    </a-tooltip>
    <a-tooltip placement="top" title="只读" v-else>
      <eyes class="dashboard-page__doc-list-item-edit-icon m-l-12 fs-16 tc-n500 iconpark-fix" />
    </a-tooltip>

    <div class="dashboard-page__doc-list-item-meta-info flex-row anis-center m-r-12">
      <doc-belong-breadcrumb class="belong m-r-24 inline-block" :doc="docItem" />
      <span class="create-time">{{ formatTime(docItem.createTime) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Eyes } from '@icon-park/vue-next';
import type { DocListItem } from "./common";
import DocBelongBreadcrumb from './doc-belong-breadcrumb.vue';

import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
dayjs.locale('zh-cn');

defineProps<{
  docItem: DocListItem
}>();

// @Methods:
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss');
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";

.dashboard-page__doc-list {
  &-item {
    border-top: 1px solid #80808012;
    user-select: none;

    &:last-child {
      border-bottom: 1px solid #80808012;
    }

    &:hover {
      background-color: #fafafa;
      border-radius: 6px;

      .dashboard-page__doc-list-item-edit-icon {
        visibility: visible;
      }
    }
  }
}

.dashboard-page__doc-list-item-meta-info {
  margin-left: auto;
  color: @N500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-page__doc-list-item-title {
  color: @N800;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: @primary-color;
  }
}

.dashboard-page__doc-list-item-edit-icon {
  width: 16px;
  height: 16px;
  visibility: hidden;
  cursor: pointer;

  &.iconpark-fix {
    position: relative;
    top: -2px;
  }
}
</style>
