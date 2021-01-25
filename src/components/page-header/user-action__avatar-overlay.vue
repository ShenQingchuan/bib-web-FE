<template>
  <a-menu class="component-user-action__avatar-overlay-menu">
    <a-menu-item @click="$router.push(`/user/${userName}`)">
      <UserOutlined />
      个人中心
    </a-menu-item>
    <a-menu-item @click="$router.push('/settings')">
      <SettingOutlined />
      帐户设置
    </a-menu-item>
    <a-menu-item @click="$router.push('/help')">
      <ReadOutlined />
      帮助文档
    </a-menu-item>
    <a-divider class="component-user-action__avatar-overlay-menu__divider" />
    <a-menu-item @click="runLogout">
      <LogoutOutlined />
      退出登录
    </a-menu-item>
  </a-menu>
</template>

<script lang="ts">
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ReadOutlined,
} from "@ant-design/icons-vue";
import { usePayloadFromToken } from "../../utils/user-token-validation";
import { runLogout } from "../../hooks/useAuthForm";

export default {
  name: "user-action__avatar-overlay",
  components: {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    ReadOutlined,
  },
  setup() {
    const { userName } = usePayloadFromToken();

    return {
      userName,
      runLogout,
    };
  },
};
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
