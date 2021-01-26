<template>
  <common-header consice />
  <a-row
    class="page-user-info__wrapper w-p80 m-lr-auto flex-row p-t-24 p-b-32 p-lr-16"
  >
    <a-col :span="8">
      <a-card class="basic-info-card flex-col anis-center">
        <a-avatar
          class="user-avatar"
          :src="userDetails.avatarURL || '/assets/svg/user-avatar__default.svg'"
        ></a-avatar>
        <h3 class="text-center m-tb-16">{{ userName }}</h3>
        <div
          class="counter-wrapper w-p100 m-t-6 m-b-32 flex-row jyct-center anis-center"
        >
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">
              {{ userDetails.fansCount }}
            </div>
            <div class="label-text">粉丝</div>
          </div>
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">
              {{ userDetails.subscribeCount }}
            </div>
            <div class="label-text">关注</div>
          </div>
        </div>
        <a-button class="m-b-20" block>
          编辑资料
        </a-button>
        <div class="w-p100 m-tb-6 text-left">
          <EnvironmentOutlined />
          <span v-if="userDetails.address">{{ userDetails.address }}</span>
          <span v-else class="m-l-8 detail-placeholder">还未填写地址</span>
          <br />
          <br />
          <ProfileOutlined />
          <p v-if="userDetails.introduce">{{ userDetails.introduce }}</p>
          <span v-else class="m-l-8 detail-placeholder">还未填写个人简介</span>
        </div>
      </a-card>
      <a-card class="m-t-16" title="团队"></a-card>
    </a-col>
    <a-col :span="15" :offset="1">
      <a-card></a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import fusions from "../fusions";
import { usePayloadFromToken } from "../utils/user-token-validation";
import CommonHeader from "../components/page-header/common-header.vue";

const { userId, userName } = usePayloadFromToken();
const userDetails = reactive({
  avatarURL: "",
  introduce: "",
  address: "",
  profession: "",
  fansCount: 0,
  subscribeCount: 0,
});

(async () => {
  const detailRes = await fusions.get(`/auth/getUserDetails?uid=${userId}`);
  if (detailRes.data.isResponseOk) {
    const { avatarURL, introduce, address, profession } = detailRes.data.data;
    userDetails.avatarURL = avatarURL;
    userDetails.introduce = introduce;
    userDetails.address = address;
    userDetails.profession = profession;
  }
})();
</script>

<style lang="less">
.page-user-info__wrapper .basic-info-card .ant-card-body {
  width: 100%;
  text-align: center;
}
</style>
<style lang="less" scoped>
@import "../less/color.less";
.page-user-info__wrapper {
  .user-avatar {
    width: 160px;
    height: 160px;
  }

  .detail-placeholder {
    color: @N500;
  }

  .counter-wrapper {
    .counter-container {
      .count-number {
        color: @primary-color;
      }
      .label-text {
        color: @N500;
      }
    }
  }
}
</style>
