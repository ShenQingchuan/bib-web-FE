<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>
