<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { provide } from 'vue';
import { globalStore, globalStoreSymbol } from '@/store';

provide(globalStoreSymbol, globalStore);
</script>
