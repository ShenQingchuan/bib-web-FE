<template>
  <a-skeleton
    class="page-wiki-index__skeleton m-tb-64 m-lr-auto"
    v-if="wikiViewLoading"
    active
    avatar
    :paragraph="{ rows: 12 }"
  ></a-skeleton>
  <a-layout v-else class="page-wiki-index__container">
    <a-layout-header class="page-wiki-index__header flex-row jyct-center anis-center">
      <template v-if="wikiViewData">
        <a-avatar
          :src="wikiViewData.creator.userDetails.avatarURL || '/assets/svg/user-avatar__default.svg'"
          @click="$router.push(`/user/${wikiViewData?.creator.userName}`)"
        />
        <a-breadcrumb class="m-r-24">
          <a-breadcrumb-item>
            <a
              class="m-l-32 tc-n500 uname-link"
              :href="`/user/${wikiViewData.creator.userName}`"
            >{{ wikiViewData.creator.userName }}</a>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <span class="text-noselect">{{ wikiViewData.name }}</span>
            <a-tooltip title="私有知识库" v-if="wikiViewData.isPrivate">
              <Lock class="iconpark m-l-12 tc-n500" theme="filled" />
            </a-tooltip>
          </a-breadcrumb-item>
        </a-breadcrumb>
        <a-button size="small" class="m-r-400">
          <Rss theme="outline" class="iconpark m-r-4" />
          {{ wikiViewData.focused ? '已关注' : '关注' }}
          <span
            class="m-l-12"
          >{{ numberFormat(wikiViewData.focusCount) || 0 }}</span>
        </a-button>

        <!-- 拥有该知识库协作者权限： -->
        <div :style="{
          opacity: wikiViewData.joined ? 1 : 0
        }">
          <a-button class="m-r-10">
            <Connect theme="outline" class="iconpark m-r-4" />分享
          </a-button>
          <a-button class="m-r-10" @click="$router.push($route.path + '/manage')">管理</a-button>
          <a-button type="primary" @click="onCreateNewDocInWiki">在此新建文档</a-button>
        </div>
      </template>
    </a-layout-header>
    <a-layout-content class="page-wiki-index__content flex-row jyct-center p-b-64">
      <div class="page-wiki-index__paper m-t-48 flex-col anis-center">
        <div class="fs-28 fw-500">{{ wikiViewData?.name }}</div>
        <p class="tc-n500 fs-18 m-tb-16">{{ wikiViewData?.name }}</p>
        <div class="page-wiki-index__paper-catalog">
          <div
            v-for="item in wikiViewData?.docs"
            :key="item.id"
            class="page-wiki-index__paper-catalog-item flex-row anis-center m-tb-12 p-tb-6 cursor-ptr"
            @click="$router.push(`/doc/${item.id}`)"
          >
            <span
              class="page-wiki-index__paper-catalog-item-doc-name fw-500 to-ellipsis"
            >{{ item.title }}</span>
            <div class="page-wiki-index__paper-catalog-item-line flex-1 m-lr-16"></div>
            <span
              class="page-wiki-index__paper-catalog-item-time tc-n500 to-ellipsis"
            >{{ useDayjs(item.updateTime).format("YYYY-MM-DD HH:mm") }}</span>
          </div>
          <a-skeleton v-if="wikiViewData && wikiViewData.docs.length < 5" :paragraph="{ rows: 2 }" />
          <div class="page-wiki-index__paper-background">
            <img src="/assets/svg/wiki-view__background.svg" alt="illustration" />
          </div>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fusions } from '@/fusions';
import { usePayloadFromToken, numberFormat } from '@/utils';
import { useDayjs } from '@/composable/useDayjs';
import { message } from 'ant-design-vue';
import { Lock, Rss, Connect } from '@icon-park/vue-next';
import type { DocumentViewData, WikiViewDataDto } from '@/models';

const route = useRoute();
const router = useRouter();
const tokenPayload = usePayloadFromToken()!;
const wikiId = route.params.wikiId as string;

// @States:
const wikiViewData = ref<WikiViewDataDto>();
const wikiViewLoading = ref(true);

// @LifeCycels:
fusions.get(`/wiki/?wikiId=${wikiId}&readerId=${tokenPayload.userId}`)
  .then((resp) => {
    if (resp.data.responseOk) {
      wikiViewData.value = resp.data.data as WikiViewDataDto;
      wikiViewLoading.value = false;
    }
  });

// @Methods:
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
</script>

<style lang="less" scoped>
@import "./common.less";
@import "@/less/color.less";

.page-wiki-index__skeleton {
  width: 80vw;
}
.page-wiki-index {
  .t-b-layout;
}
.page-wiki-index__content {
  background-color: @N50;
}
.page-wiki-index__paper {
  width: 1024px;
  height: 100%;
  min-height: 500px;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  padding: 48px 0 64px;
  position: relative;
  background-color: white;

  &-catalog {
    width: 80%;
    z-index: 2;

    &-item {
      &-line {
        border-top: 2px dashed @N300;
      }
    }
  }
  &-background img {
    z-index: 1;
    position: absolute;
    bottom: 40px;
    left: 50%;
    width: 160px;
    transform: translateX(-50%);
    opacity: 0.4;
  }
}
</style>
