<template>
  <center-card-layout>
    <template #center>
      <div class="center-container">
        <h2 class="text-center fw-400">找回密码</h2>
        <a-input
          type="email"
          v-model:value="targetUserEmail"
          placeholder="请输入要找回账号的邮箱地址"
        >
          <template #prefix>
            <MailOutlined />
          </template>
        </a-input>
        <h3 class="text-center m-t-20 fw-300">请完成滑动验证</h3>
        <TouchVerifyCode @success="onSlideVerifySuccess" />
        <a-button
          :disabled="!nextable"
          class="m-t-20 m-b-32"
          type="primary"
          block
          @click="nextStep"
        >
          下一步
        </a-button>
      </div>
    </template>
    <template #footer> </template>
  </center-card-layout>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MailOutlined } from "@ant-design/icons-vue";
import TouchVerifyCode from "../components/TouchVerifyCode/index.vue";
import CenterCardLayout from "../components/layouts/center-card-layout.vue";

export default defineComponent({
  name: "password-rest-page",
  components: {
    CenterCardLayout,
    TouchVerifyCode,
    MailOutlined
  },
  setup() {
    // @States:
    const targetUserEmail = ref("");
    const humanVerified = ref(false);
    const nextable = computed(() => {
      return targetUserEmail.value !== "" && humanVerified.value;
    });

    // @Methods:
    const onSlideVerifySuccess = () => {
      humanVerified.value = true;
    };
    const nextStep = () => {
      // TODO: 下一步进行发送邮件验证...
    };

    return {
      targetUserEmail,
      nextable,
      onSlideVerifySuccess,
      nextStep
    };
  }
});
</script>

<style lang="less" scoped>
.center-container {
  max-width: 300px;
}
</style>
