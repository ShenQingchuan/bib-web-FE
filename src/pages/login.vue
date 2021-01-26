<template>
  <center-card-layout>
    <template #center>
      <a-form
        class="page-login__form"
        ref="loginFormTRef"
        layout="vertical"
        :model="loginForm"
        :rules="loginFormRules"
        @submit.prevent
      >
        <!-- 邮箱模式 -->
        <a-form-item
          v-if="loginForm.formType === LoginFormType.EMAIL_FORM"
          name="userEmail"
          hasFeedback
        >
          <a-input
            v-model:value="loginForm.userEmail"
            placeholder="请输入邮箱地址"
          >
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>
        <!-- 用户名模式 -->
        <a-form-item
          v-if="loginForm.formType === LoginFormType.NAME_FORM"
          name="userName"
          hasFeedback
        >
          <a-input
            v-model:value="loginForm.userName"
            placeholder="请输入用户名"
          >
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>
        <!-- 密码 -->
        <a-form-item name="password" hasFeedback>
          <a-input
            v-model:value="loginForm.password"
            type="password"
            placeholder="请输入密码"
          >
            <template #prefix><LockOutlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="rememberMe">
          <a-switch v-model:checked="loginForm.rememberMe" size="small" />
          <span class="m-l-6">记住我的登录</span>
        </a-form-item>
        <!-- 提交：登录 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="button"
            :disabled="!submitable"
            @click="handleSubmitLoginForm"
            block
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <div class="flex-row vc page-login__footer-actions">
        <a
          href="/password-retrieve"
          class="page-login-register__footer-actions-item"
          >找回密码</a
        >
        <a-divider type="vertical" />
        <a-button
          class="page-login-register__footer-actions-item"
          type="link"
          @click="
            handleChangeFormType(
              loginForm.formType === LoginFormType.EMAIL_FORM
                ? LoginFormType.NAME_FORM
                : LoginFormType.EMAIL_FORM
            )
          "
          >{{
            loginForm.formType === LoginFormType.EMAIL_FORM ? "用户名" : "邮箱"
          }}登录</a-button
        >
        <a-divider type="vertical" />
        <a href="/register" class="page-login-register__footer-actions-item"
          >快速注册</a
        >
      </div>
    </template>
  </center-card-layout>
</template>

<script lang="ts">
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { useLoginForm, LoginFormType } from "../hooks/useAuthForm";
import CenterCardLayout from "../components/layouts/center-card-layout.vue";

export default {
  name: "login-page",
  components: {
    CenterCardLayout,
    LockOutlined,
    MailOutlined,
    UserOutlined,
  },
  setup() {
    return {
      ...useLoginForm(),
      LoginFormType,
    };
  },
};
</script>

<style lang="less" scoped>
@import url("../less/color.less");

.page-login__form {
  min-width: 360px;
}
.page-login__footer-actions {
  &-item:nth-child(1) {
    margin-right: 20px;
  }
  &-item:nth-child(5) {
    margin-left: 20px;
  }
  a {
    color: @B800;
  }
}
</style>
