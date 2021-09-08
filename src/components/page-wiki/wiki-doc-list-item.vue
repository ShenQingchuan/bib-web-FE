<template>
  <a-row
    class="page-wiki-manage-wiki__docs-list-item flex-row anis-center to-ellipsis p-tb-8 p-lr-48 cursor-ptr"
  >
    <a-col :span="10">
      <div class="wiki-doc-title">
        <img src="/assets/svg/dashboard__doc-icon.svg" alt="文档" width="16" height="16" />
        {{ wikiDoc.title }}
        <a-tooltip title="公开分享阅读" v-if="wikiDoc.publicSharing">
          <ShareSys class="tc-n500 iconpark m-l-10" />
        </a-tooltip>
      </div>
    </a-col>
    <a-col :span="6">
      <a
        :href="`/user/${wikiDoc.creator.userName}`"
        class="wiki-doc-author-name fs-12 tc-n500"
      >{{ wikiDoc.creator.userName }}</a>
    </a-col>
    <a-col :span="6">
      <div class="wiki-doc-update-time fs-12 tc-n500">{{ useDayjs(wikiDoc.updateTime).fromNow() }}</div>
    </a-col>
    <a-col :span="2">
      <div class="wiki-doc-operations fs-12 tc-n500">
        <a-tooltip title="编辑文档">
          <Write class="iconpark m-r-10" @click="() => $router.push(`/doc/${wikiDoc.id}/edit`)" />
        </a-tooltip>
        <a-tooltip title="删除文档">
          <Delete class="iconpark m-r-10" />
        </a-tooltip>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ShareSys, Write, Delete } from '@icon-park/vue-next';
import { useDayjs } from '@/composable/useDayjs';
import type { DocShowInWikiListDto } from "@/models";

defineProps<{
  wikiDoc: DocShowInWikiListDto
}>();
</script>

<style lang="less" scoped>
@import "@/less/color.less";

.page-wiki-manage-wiki__docs-list-item {
  border-bottom: 1px solid @N200;
  background-color: white;
}

.page-wiki-manage-wiki__docs-list-item {
  &:hover {
    background-color: @N100;
  }
}
</style>
