<template>
  <div class="flex-row vc component-page-header__container">
    <div
      class="flex-row anis-center component-page-header__inner"
      :class="{
        'jyct-btwn': !userLogined,
      }"
    >
      <!-- Header Logo -->
      <div class="flex-row anis-center component-page-header__inner-logo">
        <a href="/">
          <img src="/assets/img/Icon-png-logo.png" alt="header-logo" height="48" />
        </a>
      </div>
      <!-- 搜索框 -->
      <a-auto-complete v-show="!consice" class="component-page-header__inner-search">
        <a-input placeholder="搜索">
          <template #prefix>
            <search-outlined></search-outlined>
          </template>
        </a-input>
      </a-auto-complete>

      <!-- 导航菜单 -->
      <ul class="flex-row anis-center component-page-header__inner-nav-menu">
        <template v-for="item in navs" :key="item.name">
          <li
            class="component-page-header__inner-nav-menu-item"
            :class="{
              __active: item.href === $route.path,
            }"
          >
            <a :href="item.href">{{ item.name }}</a>
          </li>
        </template>
      </ul>

      <!-- 用户操作 -->
      <div
        v-if="userLogined"
        class="flex-row anis-center component-page-header__inner-user-actions"
      >
        <!-- 已登录用户 - 非简洁模式下可用操作 -->
        <template v-if="!consice">
          <!-- 操作::通知 -->
          <BellOutlined
            class="component-page-header__inner-user-actions-item"
            @click="$router.push('/notification')"
          />
        </template>

        <!-- 头像::用户个人相关 / 登录注册按钮 -->
        <a-popover :title="userName">
          <a-avatar
            class="component-page-header__inner-user-actions-avatar"
            src="/assets/svg/user-avatar__default.svg"
          ></a-avatar>
          <template #content>
            <user-action-avatar-overlay />
          </template>
        </a-popover>
      </div>
      <!-- 未登录状态 -->
      <div v-else class="flex-row vc component-page-header__login-register">
        <a-space>
          <a-button type="primary" @click="$router.push('/login')">登录</a-button>
          <a-button type="default" @click="$router.push('/register')">注册</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  SearchOutlined,
  ClockCircleOutlined,
  BellOutlined,
} from "@ant-design/icons-vue";
import { isBibUserTokenValid } from "../../utils/user-token-validation";
import { usePayloadFromToken } from "../../utils/user-token-validation";
import userActionAvatarOverlay from "./user-action__avatar-overlay.vue";

export default {
  name: "common-header",
  components: {
    userActionAvatarOverlay,
    SearchOutlined,
    ClockCircleOutlined,
    BellOutlined,
  },
  props: {
    consice: Boolean,
  },
  setup() {
    const userLogined = isBibUserTokenValid();
    const userName = usePayloadFromToken()?.userName ?? "";

    return {
      navs: [
        { name: "工作台", href: "/dashboard" },
        { name: "发现", href: "/expolore" },
        { name: "反馈", href: "/feedback" },
        { name: "开源", href: "/opensource" },
      ],
      userName,
      userLogined,
    };
  },
};
</script>

<style lang="less" scoped>
.component-page-header__container {
  width: 100%;
  height: 69px;
  border-bottom: 1px solid #dee0e3;
  z-index: 2;
  background-color: #fff;

  .component-page-header__inner {
    padding-left: 16px;
    padding-right: 16px;
    margin: 0 auto;
    width: 96%;
    height: 100%;

    &-logo {
      min-width: 200px;
    }
    &-search .ant-input-affix-wrapper {
      max-width: 200px;
      border-radius: 6px;
      border: none;
      margin-right: 24px;

      &,
      & input {
        background-color: #f5f5f5;
      }
    }
    &-nav-menu {
      margin: 0;
      padding: 0 20px;
      white-space: nowrap;
      list-style: none;

      &-item {
        width: fit-content;
        padding: 0 14px;
        line-height: 46px;

        a,
        a:hover,
        a:active,
        a:visited {
          color: #595959;
        }

        &.__active {
          font-weight: bold;
          color: black;
        }
      }
    }
    &-user-actions {
      margin-left: auto;

      &-item {
        cursor: pointer;
        font-size: 17px;
        margin: 0 13px;
        &:hover {
          color: @primary-color;
        }
      }
      &-avatar {
        cursor: pointer;
        margin-left: 24px;
      }
    }
  }
}

.user-actions__new {
  display: inline-block;
  vertical-align: top;
  width: 18px;
  height: 18px;
  background: url("../../assets/svg/user-actions__new.svg");
}
</style>

<style lang="less">
.component-page-header__container
  .component-page-header__inner-search
  .ant-input-affix-wrapper {
  max-width: 200px;
  border-radius: 6px;
  border: none;
  margin-right: 24px;
  box-shadow: none !important;
  &,
  & input {
    background-color: #f5f5f5;
  }
}
</style>
