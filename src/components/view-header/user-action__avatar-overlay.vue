<template>
  <a-menu class="component-user-action__avatar-overlay-menu">
    <a-menu-item @click="$router.push(`/user/${userName}`)">
      <UserOutlined /><span class="m-l-12">个人中心</span>
    </a-menu-item>
    <a-menu-item @click="$router.push('/user-settings')">
      <SettingOutlined /><span class="m-l-12">帐户设置</span>
    </a-menu-item>
    <a-menu-item @click="$router.push('/help')">
      <ReadOutlined /><span class="m-l-12">帮助文档</span>
    </a-menu-item>
    <a-divider class="component-user-action__avatar-overlay-menu__divider" />
    <a-menu-item @click="runLogout">
      <LogoutOutlined /><span class="m-l-12">退出登录</span>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ReadOutlined
} from '@ant-design/icons-vue';
import { runLogout } from '@/composable/useAuthForm';

defineProps<{
  userName: string;
}>();
</script>

<style lang="less" scoped>
.component-user-action__avatar-overlay-menu {
  width: 200px;
  user-select: none;
  border: none;

  &__divider {
    margin: 4px 0;
  }
}
</style>
