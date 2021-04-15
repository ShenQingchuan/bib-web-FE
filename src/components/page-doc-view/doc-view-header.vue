<template>
  <div class="page-document-view__header flex-row anis-center jyct-btwn p-10">
    <div class="flex-row anis-center p-l-24 p-r-16">
      <a v-show="!editing" href="/">
        <img src="/assets/img/Icon-png-logo.png" alt="header-logo" height="48" class="m-r-24" />
      </a>
      <a-breadcrumb v-if="docData">
        <!-- 作者用户名 -->
        <a-breadcrumb-item>
          <a
            :href="`/user/${docData.creator.userName}`"
            class="page-document-view__header-breadcrumb"
          >{{ docData.creator.userName }}</a>
        </a-breadcrumb-item>

        <!-- 如果在知识库中 显示知识库名称 -->
        <a-breadcrumb-item v-if="docData.inWiki">
          <a
            :href="`/wiki/${docData.inWiki.id}`"
            class="page-document-view__header-breadcrumb"
          >{{ docData.inWiki.name }}</a>

          <a-tooltip title="私密知识库">
            <lock
              theme="filled"
              size="14"
              class="page-document-view__header-breadcrumb-lock iconpark m-l-10"
              v-show="docData.inWiki.private"
            />
          </a-tooltip>
        </a-breadcrumb-item>

        <!-- 显示文档标题 -->
        <a-breadcrumb-item>
          <span class="fs-15 fw-500 text-noselect">{{ docData.title }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="flex-row anis-center p-r-24">
      <template v-show="!editing">
        <a-tooltip :title="thumbsUped ? '已收藏' : '收藏'">
          <star
            :theme="thumbsUped ? 'filled' : 'outline'"
            :fill="thumbsUped ? '#ffc60a' : undefined"
            size="20"
            class="iconpark m-r-20 cursor-ptr"
            @click="handleStar"
          />
        </a-tooltip>
      </template>

      <a-tooltip title="添加协作用户">
        <people-plus theme="outline" :size="20" class="iconpark m-r-20 cursor-ptr" />
      </a-tooltip>
      <a-button class="m-lr-10" v-show="!editing">分享阅读</a-button>
      <a-button class="m-lr-10" v-if="!editing" type="primary" @click="onDocumentEdit">编辑</a-button>
      <a-button class="m-lr-10" v-else @click="onDocumentEdit">保存提交</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { Lock, PeoplePlus, Star } from '@icon-park/vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalStore } from '@/store';
import type { DocumentViewData } from '@/models';

const props = defineProps<{
  editing?: boolean;
  docData?: DocumentViewData,
}>()

// @States:
const router = useRouter(), route = useRoute();
const thumbsUped = ref(props.docData?.thumbsUped || false);
const globalStore = useGlobalStore();

// @LifeCycles:

// @Methods:
const handleStar = () => {
  thumbsUped.value = !thumbsUped.value;

  // TODO: debounce 提交 “收藏文章” 请求
}
const onDocumentEdit = () => {
  globalStore.editDocumentParam = props.docData;
  router.push(`${route.path}/edit`);
}
</script>

<style lang="less" scoped>
@import "../../less/color.less";
@import "../../less/shared.less";

.page-document-view__header {
  background-color: #fff;
  box-shadow: 0 3px 10px @N200;
  position: fixed;
  width: 100vw;
  z-index: 2;
}
.page-document-view__header-breadcrumb {
  color: @N600;
  &:hover {
    color: @primary-color;
  }
}
</style>