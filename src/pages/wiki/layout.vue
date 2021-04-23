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
import { ref } from 'vue';
import CommonHeader from '@/components/view-header/common-header.vue';

// @States:

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
@import "./common.less";

.page-wiki {
  .t-b-layout;
}
</style>
