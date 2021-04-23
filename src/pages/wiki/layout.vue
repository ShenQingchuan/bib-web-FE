<template>
  <a-layout class="page-wiki__container">
    <a-layout-header class="page-wiki__header">
      <common-header consice />
    </a-layout-header>
    <a-layout-content class="page-wiki__content">
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
import CommonHeader from '@/components/view-header/common-header.vue';
</script>

<style lang="less" scoped>
@import "./common.less";
@import "@/less/color.less";

.page-wiki {
  .t-b-layout;
}
.page-wiki__content {
  background-color: @N50;
}
</style>
