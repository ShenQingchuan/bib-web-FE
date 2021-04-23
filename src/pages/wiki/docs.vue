<template>
  <div class="page-wiki-manage-wiki__docs-wrapper flex-col p-tb-8 m-lr-auto">
    <div class="flex-row jyct-center anis-center p-b-32 p-lr-12">
      <common-searcher />
      <a-button class="m-l-10" @click="onCreateNewDocInWiki">在此知识库新建文档</a-button>
    </div>

    <!-- 文档列表 表头 -->
    <a-row
      v-if="wikiDocList.length > 0"
      class="page-wiki-manage-wiki__docs-list-header flex-row anis-center to-ellipsis tc-n500 p-tb-6 p-lr-48"
    >
      <a-col :span="10">
        <div class="fs-12">文档标题</div>
      </a-col>
      <a-col :span="6">
        <div class="fs-12">作者</div>
      </a-col>
      <a-col :span="6">
        <div class="fs-12">最近更新时间</div>
      </a-col>
      <a-col :span="2">
        <div class="fs-12">操作</div>
      </a-col>
    </a-row>

    <a-skeleton active :loading="wikiDocsListLoading">
      <a-empty class="m-tb-60" v-if="wikiDocList.length === 0" description="知识库暂时还没有文档..." />
      <template v-else>
        <a-row
          v-for="doc in wikiDocList"
          :key="doc.id"
          class="page-wiki-manage-wiki__docs-list-item flex-row anis-center to-ellipsis p-tb-8 p-lr-48 cursor-ptr"
        >
          <a-col :span="10">
            <div class="wiki-doc-title">
              <img src="/assets/svg/dashboard__doc-icon.svg" alt="文档" width="16" height="16" />
              {{ doc.title }}
              <a-tooltip title="公开分享阅读" v-if="doc.publicSharing">
                <ShareSys class="tc-n500 iconpark m-l-10" />
              </a-tooltip>
            </div>
          </a-col>
          <a-col :span="6">
            <a
              :href="`/user/${doc.creator.userName}`"
              class="wiki-doc-author-name fs-12 tc-n500"
            >{{ doc.creator.userName }}</a>
          </a-col>
          <a-col :span="6">
            <div class="wiki-doc-update-time fs-12 tc-n500">{{ useDayjs(doc.updateTime).fromNow() }}</div>
          </a-col>
          <a-col :span="2">
            <div class="wiki-doc-operations fs-12 tc-n500">
              <Write class="iconpark m-r-10" @click="$router.push(`/doc/${doc.id}/edit`)" />
              <Delete class="iconpark m-r-10" />
            </div>
          </a-col>
        </a-row>
        <a-button v-if="wikiDocsListPage !== wikiDocsListPageTotal" @click="fetchDocList">加载更多</a-button>
      </template>
    </a-skeleton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShareSys, Write, Delete } from '@icon-park/vue-next';
import { useDayjs } from '@/composable/useDayjs';
import { usePayloadFromToken } from '@/utils';
import { fusions } from '@/fusions';
import { message } from 'ant-design-vue';
import CommonSearcher from '@/components/common-search/search.vue';
import type { DocShowInWikiListDto, DocumentViewData } from '@/models';

const tokenPayload = usePayloadFromToken()!;
const route = useRoute();
const router = useRouter();
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
const onCreateNewDocInWiki = () => {
  message.loading("初始化新文档中，请稍候...");
  fusions.post('/docs/', {
    userId: tokenPayload.userId,
    wikiId
  }).then((resp) => {
    if (resp.data.responseOk) {
      const newDocViewData = resp.data.data as DocumentViewData
      router.push(`/doc/${newDocViewData.id}/edit`).then(() => message.destroy());
    }
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
