<template>
  <center-card-layout>
    <template #center>
      <a-form
        class="page-register__form"
        ref="registerFormTRef"
        layout="vertical"
        :model="registerForm"
        :rules="registerFormRules"
        @submit.prevent
      >
        <!-- 用户名 -->
        <a-form-item name="userName" hasFeedback>
          <a-input
            v-model:value="registerForm.userName"
            placeholder="请输入用户名"
            ><template #prefix><UserOutlined /></template
          ></a-input>
        </a-form-item>
        <!-- 邮箱地址 -->
        <a-form-item name="userEmail" hasFeedback>
          <a-input
            v-model:value="registerForm.userEmail"
            placeholder="请输入邮箱地址"
          >
            <template #prefix><MailOutlined /></template
          ></a-input>
        </a-form-item>
        <!-- 密码 -->
        <a-form-item name="password" hasFeedback>
          <a-input
            v-model:value="registerForm.password"
            placeholder="请输入密码"
            type="password"
            ><template #prefix><LockOutlined /></template
          ></a-input>
        </a-form-item>
        <!-- 确认密码 -->
        <a-form-item name="confirmPassword" hasFeedback>
          <a-input
            v-model:value="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
            ><template #prefix><LockOutlined /></template
          ></a-input>
        </a-form-item>
        <!-- 提交：注册 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="button"
            :disabled="!submitable"
            @click="handleSubmitRegisterForm"
            block
          >
            注册
          </a-button>
        </a-form-item>
      </a-form>
      <div class="page-register__agreement-tips">
        注册即表明同意 <a href="/service-protocol">《Bib 服务协议》</a>
      </div>
    </template>
    <template #footer>
      <div class="flex-row vc page-register__footer-actions">
        <a href="/login" class="page-login-register__footer-actions-item"
          >已有账号？立即登录</a
        >
      </div>
    </template>
  </center-card-layout>
</template>

<script lang="ts">
import {
  MailOutlined,
  LockOutlined,
  UserOutlined
} from "@ant-design/icons-vue";
import CenterCardLayout from "../components/layouts/center-card-layout.vue";
import { useRegisterForm } from "../hooks/useAuthForm";

export default {
  name: "RegisterPage",
  components: {
    CenterCardLayout,
    MailOutlined,
    LockOutlined,
    UserOutlined
  },
  setup() {
    return {
      ...useRegisterForm()
    };
  }
};
</script>

<style lang="less" scoped>
@import url("../less/color.less");

.page-register__form {
  min-width: 300px;
}
.page-register__agreement-tips {
  margin-bottom: 24px;
  color: @N500;
  font-weight: 300;
}
.page-register__footer-actions {
  a {
    color: @B800;
  }
}
</style>
