<template>
  <div class="page-document-view__header flex-row anis-center jyct-btwn p-tb-16">
    <div class="flex-row anis-center p-l-24 p-r-16">
      <a v-show="!editing" href="/">
        <img src="/assets/img/Icon-png-logo.png" alt="header-logo" height="48" class="m-r-24" />
      </a>
      <a-breadcrumb v-if="viewData">
        <!-- 作者用户名 -->
        <a-breadcrumb-item>
          <a
            :href="`/user/${viewData.creator.userName}`"
            class="page-document-view__header-breadcrumb"
          >{{ viewData.creator.userName }}</a>
        </a-breadcrumb-item>

        <!-- 如果在知识库中 显示知识库名称 -->
        <a-breadcrumb-item v-if="viewData.inWiki">
          <a
            :href="`/wiki/${viewData.inWiki.id}`"
            class="page-document-view__header-breadcrumb"
          >{{ viewData.inWiki.name }}</a>

          <a-tooltip title="私密知识库">
            <lock
              theme="filled"
              size="14"
              class="page-document-view__header-breadcrumb-lock iconpark m-l-10"
              v-show="viewData.inWiki.isPrivate"
            />
          </a-tooltip>
        </a-breadcrumb-item>

        <!-- 显示文档标题 -->
        <a-breadcrumb-item>
          <span class="fs-15 fw-500 text-noselect">{{ viewData.title || '未输入文章标题...' }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="flex-row anis-center p-r-24">
      <a-tooltip title="添加协作用户">
        <people-plus theme="outline" :size="20" class="iconpark m-r-20 cursor-ptr" />
      </a-tooltip>
      <a-button class="m-lr-10" v-show="!editing">分享阅读</a-button>

      <a-button class="m-lr-10" v-if="!editing" type="primary" @click="onDocumentEdit">编辑</a-button>
      <a-button class="m-lr-10" v-else @click="quitDocumentEdit">保存并退出编辑</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Lock, PeoplePlus } from '@icon-park/vue-next';
import { fusions } from '@/fusions';
import { editingDocViewData, savedDocViewData } from '@/pages/document/editing-doc-storage-ref';
import type { DocumentViewData } from '@/models';

const props = defineProps<{
  editing?: boolean;
  viewData?: DocumentViewData,
}>()

// @States:
const router = useRouter(), route = useRoute();
const docId = route.params.docId as string;

// @LifeCycles:

// @Methods:
const onDocumentEdit = () => {
  editingDocViewData.value =
    props.viewData
    ?? savedDocViewData.value[docId]
    ?? null;
  router.push(`${route.path}/edit`);
}
const quitDocumentEdit = () => {
  const { title, contentAbstract, publicSharing } = props.viewData!;
  const savingForm = { docId, title, contentAbstract, publicSharing };
  fusions.put('/docs/meta', savingForm).then(resp => {
    if (resp.data.responseOk) {
      savedDocViewData.value[docId] = resp.data.data as DocumentViewData;
      editingDocViewData.value = null;

      router.push(route.path.slice(0, -5));
    }
  });

}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "@/less/shared.less";

.page-document-view__header {
  background-color: #fff;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 2;
  border-bottom: 1px solid @N200;
}
.page-document-view__header-breadcrumb {
  color: @N600;
  &:hover {
    color: @primary-color;
  }
}
</style>
