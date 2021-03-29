<template>
  <common-header consice />

  <div class="page-user-settings__wrapper m-tb-48 m-lr-auto p-32">
    <a-tabs v-model:activeKey="activeTabKey" :animated="false">
      <a-tab-pane key="profile" tab="个人信息">个人信息</a-tab-pane>
      <a-tab-pane key="account" tab="账户管理">账户管理</a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CommonHeader from '../components/page-header/common-header.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTabKey = ref(window.location.hash || 'profile');

</script>

<style lang="less" scoped>
@import "../less/color.less";
.page-user-settings__wrapper {
  width: 100%;
  max-width: 900px;
  border-radius: 10px;
  box-shadow: 0 5px 10px @N300;
}
</style>
