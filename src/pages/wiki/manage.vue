<template>
  <a-layout class="page-wiki-manage__container">
    <a-layout-header class="page-wiki-manage__header flex-row anis-center">
      <div class="flex-row anis-center page-wiki-manage__header-tabs m-lr-auto">
        <div class="page-wiki-manage-header-back p-lr-32 m-r-48 cursor-ptr flex-row anis-center">
          <ArrowLeft class="iconpark m-r-10" size="18" />返回目录
        </div>

        <div
          class="page-wiki-manage__header-tab p-lr-16 m-lr-24 cursor-ptr"
          :class="{
            active: $route.meta.tab === 'docs'
          }"
        >管理文档</div>
        <div
          class="page-wiki-manage__header-tab p-lr-16 m-lr-24 cursor-ptr"
          :class="{
            active: $route.meta.tab === 'members'
          }"
        >协作者</div>
        <div
          class="page-wiki-manage__header-tab p-lr-16 m-lr-24 cursor-ptr"
          :class="{
            active: $route.meta.tab === 'settings'
          }"
        >设置</div>
      </div>
    </a-layout-header>
    <a-layout-content class="page-wiki-manage__content p-lr-32 p-tb-24">
      <router-view v-slot="{ Component, route }">
        <keep-alive v-if="route.meta.keepalive">
          <component :is="Component" />
        </keep-alive>
        <component :is="Component" v-else />
      </router-view>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@icon-park/vue-next';

// @States:

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
@import "./common.less";
@import "@/less/color.less";

.page-wiki-manage {
  .t-b-layout;
}
.page-wiki-manage__header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.page-wiki-manage__header-tab {
  &:hover,
  &.active {
    border-bottom: 2px solid @primary-color;
    font-weight: 500;
  }
}
.page-wiki-manage-header-back {
  &:hover {
    font-weight: 500;
  }
  & .iconpark {
    top: 4px;
  }
}
.page-wiki-manage__content {
  background-color: #fbfbfb;
}
</style>
