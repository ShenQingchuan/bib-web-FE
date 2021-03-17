<template>
  <center-card-layout>
    <template #center>
      <div class="center-container w-p100">
        <h2 class="text-center fw-400" v-if="step < 2">找回密码</h2>

        <!-- 步骤1：填写要找回账号的邮箱地址 -->
        <template v-if="step === 0">
          <a-input type="email" v-model:value="targetUserEmail" placeholder="请输入要找回账号的邮箱地址">
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
          <h3 class="text-center m-t-20 fw-300">请完成滑动验证</h3>
          <TouchVerifyCode @success="onSlideVerifySuccess" />
        </template>
        <!-- 步骤1：END -->

        <!-- 步骤2：用户填写邮箱中收到的验证码、新的密码 -->
        <template v-else-if="step === 1">
          <a-form
            class="w-p100"
            ref="retrieveFormTRef"
            layout="vertical"
            :model="retrieveForm"
            :rules="registerFormRules"
            @submit.prevent
          >
            <a-form-item name="vcode" hasFeedback>
              <a-input v-model:value="retrieveForm.vcode" placeholder="请输入验证码">
                <template #prefix>
                  <KeyOutlined />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item name="newPassword" hasFeedback>
              <a-input
                type="password"
                v-model:value="retrieveForm.newPassword"
                placeholder="请输入新密码"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item name="newPasswordConfirm" hasFeedback>
              <a-input
                type="password"
                v-model:value="retrieveForm.newPasswordConfirm"
                placeholder="请再次输入新密码"
              >
                <template #prefix>
                  <ReloadOutlined />
                </template>
              </a-input>
            </a-form-item>
          </a-form>
        </template>
        <!-- 步骤2：END -->

        <!-- 步骤3: 提示完成 -->
        <template v-else-if="step === 2">
          <div class="flex-col anis-center">
            <CheckCircleFilled class="finish-icon" />
            <h3 class="m-tb-12">
              <i>修改密码成功！</i>
            </h3>
          </div>
        </template>
        <!-- 步骤3: END -->

        <a-button
          :disabled="!nextable[step]?.value"
          class="m-t-20 m-b-32"
          type="primary"
          block
          @click="onNextStep[step]"
        >{{ step < 2 ? "下一步" : "立即登录" }}</a-button>
      </div>
    </template>
  </center-card-layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  ReloadOutlined,
  CheckCircleFilled,
} from "@ant-design/icons-vue";
import TouchVerifyCode from "../components/TouchVerifyCode/index.vue";
import CenterCardLayout from "../components/layouts/center-card-layout.vue";
import {
  EMAIL_REGEXP,
  PASSWORD_REGEXP,
  VCODE_REGEXP,
} from "../utils/commonly-used-regexp";
import { fusions } from "../fusions";
import { message, Form } from "ant-design-vue";
import { ValidationRule } from "ant-design-vue/lib/form/Form";
import { LoginRegisterFormError } from "../composable/useAuthForm";

const messageKey = "passwordRetrieve";
const router = useRouter();

// @States:
const targetUserEmail = ref("");
const targetUserName = ref("");
const humanVerified = ref(false);
const step = ref(0);
const retrieveForm = reactive({
  vcode: "",
  newPassword: "",
  newPasswordConfirm: "",
});
const retrieveFormTRef = ref<InstanceType<typeof Form> | null>(null);
const registerFormRules: Record<string, ValidationRule[]> = {
  vcode: [
    {
      validator: (rule, value) => {
        if (!VCODE_REGEXP.test(value)) {
          return Promise.reject(LoginRegisterFormError.VCODE_FORMAT_INVALID);
        }
        return Promise.resolve();
      },
    },
  ],
  newPassword: [
    {
      validator: (rule, value) => {
        if (!PASSWORD_REGEXP.test(value)) {
          return Promise.reject(LoginRegisterFormError.PASSWORD_FORMAT_INVALID);
        }
        return Promise.resolve();
      },
    },
  ],
  newPasswordConfirm: [
    {
      validator: (rule, value) => {
        if (value !== retrieveForm.newPassword) {
          return Promise.reject(LoginRegisterFormError.PASSWORD_NOTSAME);
        }
        return Promise.resolve();
      },
    },
  ],
};
const nextable = [
  computed(() => {
    return (
      targetUserEmail.value !== "" &&
      EMAIL_REGEXP.test(targetUserEmail.value) &&
      humanVerified.value
    );
  }),
  computed(() => {
    return (
      retrieveFormTRef.value?.fields.reduce(
        (p, c) => p + c.errors.length,
        0
      ) === 0 &&
      retrieveFormTRef.value?.fields.every((field) => field.fieldValue !== "")
    );
  }),
  ref(true), // 最后一关是跳转立即登录
];

// @Methods:
const onSlideVerifySuccess = () => {
  humanVerified.value = true;
};
const onNextStep = [
  async () => {
    const queryForUserName = await fusions.get(
      `/auth/seekByEmail?email=${targetUserEmail.value}`
    );
    if (queryForUserName.data.isResponseOk) {
      targetUserName.value = queryForUserName.data.data.userName;
    }

    message.loading({ content: "加载中，请稍候...", key: messageKey });
    const res = await fusions.post("/auth/passwordRetrieve", {
      userEmail: targetUserEmail.value,
    });
    if (res.data.isResponseOk) {
      message.success({ content: "验证码邮件已发送！", key: messageKey });
      step.value++;
    } else
      return message.error({
        content: res.data.message || "邮件验证码发送失败，请联系开发团队！",
        key: messageKey,
      });
  },
  async () => {
    message.loading({ content: "加载中，请稍候...", key: messageKey });
    const res = await fusions.post("/auth/passwordRetrieveVerify", {
      userEmail: targetUserEmail.value,
      vcode: retrieveForm.vcode,
      newPassword: retrieveForm.newPassword,
    });
    if (res.data.isResponseOk) {
      message.success({ content: "验证码正确！", key: messageKey });
      step.value++;
    } else return message.error({ content: "验证码不正确！", key: messageKey });
  },
  async () => {
    message.loading({ content: "正在转回登录页...", key: messageKey });
    router
      .push(
        `/login?type=email&` +
        `userEmail=${targetUserEmail.value}&` +
        `userName=${targetUserName.value}`
      )
      .then(() => message.destroy());
  },
];
</script>

<style lang="less" scoped>
.center-container {
  max-width: 300px;
}

.finish-icon {
  color: #52c41a;
  font-size: 36px;
}
</style>
