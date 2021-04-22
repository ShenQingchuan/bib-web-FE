<template>
  <a-config-provider :locale="zhCN">
    <router-view v-slot="{ Component, route }">
      <keep-alive v-if="route.meta.keepalive">
        <component :is="Component" />
      </keep-alive>
      <component :is="Component" v-else />
    </router-view>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>
