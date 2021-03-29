<template>
  <common-header consice />
  <a-row class="page-user-info__wrapper w-p80 m-lr-auto flex-row p-t-24 p-b-32 p-lr-16">
    <a-col :span="8">
      <!-- 基本资料 -->
      <a-card class="basic-info-card flex-col anis-center">
        <a-avatar
          class="user-avatar"
          :src="userDetails.avatarURL || '/assets/svg/user-avatar__default.svg'"
        ></a-avatar>
        <h3 class="text-center m-tb-16">{{ userName }}</h3>
        <div class="counter-wrapper w-p100 m-t-6 m-b-32 flex-row jyct-center anis-center">
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">{{ userDetails.fansCount }}</div>
            <div class="label-text">粉丝</div>
          </div>
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">{{ userDetails.subscribeCount }}</div>
            <div class="label-text">关注</div>
          </div>
        </div>
        <a-button class="m-b-20" block>编辑资料</a-button>
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

      <!-- 加入的团队列表 -->
      <a-card class="m-t-16" title="团队" :bodyStyle="{ padding: '6px 12px' }">
        <a-empty
          v-if="!joinedOrgs.length"
          description="暂无团队"
          image="/assets/img/no-team__empty-placeholder.png"
          :imageStyle="{
            width: '24px',
            height: '24px',
            margin: '10px auto'
          }"
        />
        <div class="flex-row anis-center p-6">
          <div v-for="org in joinedOrgs" :key="org.id" class="flex-col anis-center">
            <a-avatar :size="48" :src="org.avatarURL" class="detail-org-avatar" />
            <span class="detail-org-name p-6 fs-12">{{ org.name }}</span>
          </div>
        </div>
      </a-card>
    </a-col>
    <a-col :span="13" :offset="1">
      <a-card>
        <template #title>
          <div class="flex-row anis-center">
            <img src="/assets/svg/user-center__activity-icon.svg" alt="动态" width="26" height="26" />
            <h4 class="inline m-tb-0 m-l-4">动态</h4>
          </div>
        </template>

        <!-- 动态卡片内容区域 -->
        <a-timeline>
          <user-activity-card v-for="act in activities" :key="act.activityTime" :activity="act" />
          <a-timeline-item>
            <template #dot>
              <local-two theme="outline" size="16" />
            </template>
            <span class="user-center__activity-nomoredot-text m-t-6">找不到更早的动态了，就让以前随风而逝吧…</span>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute } from 'vue-router';
import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { LocalTwo } from '@icon-park/vue-next';
import { fusions, mocker } from "../fusions";
import CommonHeader from "../components/page-header/common-header.vue";
import UserActivityCard from '../components/page-user-center/user-activity-card.vue';
import type { Organization, UserActivity } from '../models'

const userDetails = reactive({
  avatarURL: "",
  introduce: "",
  address: "",
  profession: "",
  fansCount: 0,
  subscribeCount: 0,
});
const joinedOrgs = ref<Organization[]>([]);
const activities = ref<UserActivity[]>([]);
const route = useRoute();
let userName = route.params['userName'] as string;

(async () => {
  const detailRes = await fusions.get(`/user/userDetails?userName=${userName}`);
  if (detailRes.data.responseOk) {
    const { avatarURL, introduce, address, profession } = detailRes.data.data;
    userDetails.avatarURL = avatarURL;
    userDetails.introduce = introduce;
    userDetails.address = address;
    userDetails.profession = profession;
  }
})();

(async () => {
  const joinedOrgsRes = await fusions.get(`/user/joinedOrgs?userName=${userName}`);
  if (joinedOrgsRes.data.responseOk) {
    joinedOrgs.value = joinedOrgsRes.data.data;
  }
})();

(async () => {
  const UserActivitiesRes = await mocker.get(`/user/activities?userName=${userName}`);
  if (UserActivitiesRes.data.responseOk) {
    activities.value = UserActivitiesRes.data.data;
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

.detail-org-avatar {
  cursor: pointer;
}
.detail-org-name,
.user-center__activity-nomoredot-text {
  color: @N500;
}
</style>
