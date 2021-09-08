<template>
  <div class="page-dashboard__wiki-list-item p-tb-14 p-l-10 p-r-20 flex-row anis-center">
    <img src="/assets/svg/dashboard__wiki-icon.svg" width="24" height="24" />
    <a
      class="page-dashboard__wiki-list-item-title m-l-24 fs-14"
      :href="`/wiki/${wiki.id}`"
    >{{ wiki.name }}</a>
    <a-tooltip title="私有知识库" v-if="wiki.isPrivate">
      <Lock theme="filled" class="m-l-14 iconpark tc-n500" />
    </a-tooltip>
    <a-tooltip v-if="wiki.organization" :title="`${wiki.organization.name} 团队所属`">
      <Peoples theme="filled" class="m-l-10 iconpark tc-n500" />
    </a-tooltip>

    <span class="m-l-auto tc-n500">最近更新于：{{ formatTime(wiki.updateTime) }}</span>
    <div
      class="m-l-20 page-dashboard__wiki-manage cursor-ptr tc-primary"
      @click="$router.push(`/wiki/${wiki.id}/manage`)"
    >管理</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { Lock, Peoples } from '@icon-park/vue-next';
import { useDayjs } from "@/composable/useDayjs";
import type { WikiListItemData } from './common';

defineProps<{
  wiki: WikiListItemData
}>();

const router = useRouter();

// @States:

// @Methods:
const formatTime = (timestamp: number) => {
  return useDayjs(timestamp).format('YYYY/MM/DD HH:mm:ss');
}
</script>

<style lang="less" scoped>
@import "./common.less";
.page-dashboard__wiki-list-item {
  .list-item;
}
.page-dashboard__wiki-list-item-title {
  .list-item-title;
}
</style>
