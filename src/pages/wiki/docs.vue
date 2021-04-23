<template>
  <div class="page-wiki-manage-wiki__docs-wrapper flex-col p-tb-8 m-lr-auto">
    <div
      v-if="wikiDocList.length > 0"
      class="page-wiki-manage-wiki__docs-list-header flex-row anis-center tc-n500 p-tb-6 p-lr-48"
    >
      <div class="fs-12 flex-1">文档标题</div>
      <div class="fs-12 m-r-280">作者</div>
      <div class="fs-12 m-r-200">更新时间</div>
      <div class="fs-12">操作</div>
    </div>

    <a-skeleton active :loading="wikiDocsListLoading">
      <a-empty class="m-tb-60" v-if="wikiDocList.length === 0" description="知识库暂时还没有文档..." />
      <template v-else>
        <div class="w-p100 flex-row anis-center jyct-center">
          <div
            v-for="doc in wikiDocList"
            :key="doc.id"
            class="page-wiki-manage-wiki__docs-list-item flex-row anis-center p-tb-8 p-lr-48 cursor-ptr"
          >
            <div class="wiki-doc-title flex-1">
              {{ doc.title }}
              <a-tooltip title="公开分享阅读" v-if="doc.publicSharing">
                <ShareSys class="tc-n500 iconpark m-l-10" />
              </a-tooltip>
            </div>
            <a
              :href="`/user/${doc.creator.userName}`"
              class="wiki-doc-author-name m-r-280 fs-12 tc-n500"
            >{{ doc.creator.userName }}</a>
            <div
              class="wiki-doc-update-time m-r-200 fs-12 tc-n500"
            >{{ useDayjs(doc.updateTime).fromNow() }}</div>
            <div class="wiki-doc-operations fs-12 tc-n500">
              <Write class="iconpark m-l-10" />
              <MoreOne class="iconpark m-l-10" />
            </div>
          </div>
          <a-button v-if="wikiDocsListPage !== wikiDocsListPageTotal" @click="fetchDocList">加载更多</a-button>
        </div>
      </template>
    </a-skeleton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ShareSys, Write, MoreOne } from '@icon-park/vue-next';
import { useDayjs } from '@/composable/useDayjs';
import { usePayloadFromToken } from '@/utils';
import { fusions } from '@/fusions';
import type { DocShowInWikiListDto } from '@/models';

const tokenPayload = usePayloadFromToken()!;
const route = useRoute();
const wikiId = route.params.wikiId as string;

// @States:
const wikiDocList = ref<DocShowInWikiListDto[]>([]);
const wikiDocsListPage = ref(0);
const wikiDocsListPageTotal = ref(0);
const wikiDocsListLoading = ref(false);

// @Methods:
const fetchDocList = () => {
  if (wikiDocsListPage.value === 0) {
    wikiDocsListLoading.value = true;
  }
  fusions.get(`/wiki/allDocs?wikiId=${wikiId}&pageNum=${wikiDocsListPage.value}`)
    .then(res => {
      wikiDocList.value.push(...res.data.data.items);
      if (wikiDocsListPage.value === 0) {
        wikiDocsListPageTotal.value = res.data.data.pageTotal;
        wikiDocsListLoading.value = false;
      }

      wikiDocsListPage.value += 1;
    });
}

// @LifeCycels:
onMounted(() => {
  fetchDocList();
});
</script>

<style lang="less" scoped>
@import "@/components/page-dashboard/common.less";
@import "@/less/color.less";

.page-wiki-manage-wiki__docs-wrapper {
  width: 1024px;
}
.page-wiki-manage-wiki__docs-list-header {
  border: 1px solid @N200;
  border-radius: 6px 6px 0 0;
}
.page-wiki-manage-wiki__docs-list-header,
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
