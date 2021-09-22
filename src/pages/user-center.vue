<template>
  <common-header consice :avatarURL="userDetails.avatarURL" />
  <a-row
    class="page-user-info__wrapper w-p80 m-lr-auto flex-row p-t-24 p-b-32 p-lr-16"
  >
    <!-- 用户中心 左栏 -->
    <a-col :span="8">
      <!-- 基本资料 -->
      <a-card class="basic-info-card flex-col anis-center">
        <a-avatar
          class="user-avatar"
          :src="userAvatarUrlFix(userDetails.avatarURL)"
        ></a-avatar>
        <h3 class="text-center m-tb-16">{{ userName }}</h3>
        <div
          class="counter-wrapper w-p100 m-t-6 m-b-32 flex-row jyct-center anis-center"
        >
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">
              {{ userDetails.followersCount }}
            </div>
            <div class="label-text">粉丝</div>
          </div>
          <div class="counter-container flex-col anis-center">
            <div class="count-number fs-20 fw-700 m-lr-32">
              {{ userDetails.followingsCount }}
            </div>
            <div class="label-text">关注</div>
          </div>
        </div>

        <!-- 不是自己的就显示关注按钮 -->
        <a-button
          v-if="isMe"
          class="m-b-20"
          block
          @click="
            $router.push({
              path: '/user-settings#profile'
            })
          "
          >编辑资料</a-button
        >
        <a-button v-else class="m-b-20" block @click="onFollowUser">{{
          focused ? '取消关注' : '关注'
        }}</a-button>

        <div class="w-p100 m-tb-6 text-left">
          <div class="flex-row anis-center m-tb-16">
            <EnvironmentOutlined />
            <span
              class="user-detail-address m-l-16"
              v-if="userDetails.address"
              >{{ userDetails.address }}</span
            >
            <span v-else class="m-l-8 detail-placeholder">还未填写地址</span>
          </div>

          <div class="flex-row anis-center m-tb-16">
            <ProfileOutlined />
            <p
              class="user-detail-introduce m-l-16 m-tb-0 inline"
              v-if="userDetails.introduce"
            >
              {{ userDetails.introduce }}
            </p>
            <span v-else class="m-l-8 detail-placeholder"
              >还未填写个人简介</span
            >
          </div>
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
          <div
            v-for="org in joinedOrgs"
            :key="org.id"
            class="flex-col anis-center"
          >
            <a :href="`/org/${org.id}`">
              <a-avatar
                :size="48"
                :src="org.avatarURL || '/assets/svg/org-avatar__default.svg'"
                class="detail-org-avatar"
              />
            </a>
            <span class="detail-org-name p-6 fs-12">{{ org.name }}</span>
          </div>
        </div>
      </a-card>
    </a-col>

    <!-- 用户中心 右栏 用户动态 -->
    <a-col :span="13" :offset="1">
      <a-card>
        <template #title>
          <div class="flex-row anis-center">
            <img
              src="/assets/svg/user-center__activity-icon.svg"
              alt="动态"
              width="26"
              height="26"
            />
            <h4 class="inline m-tb-0 m-l-4">动态</h4>
          </div>
        </template>

        <!-- 动态卡片内容区域 -->
        <div
          class="user-activity-loading flex-row jyct-center anis-center"
          v-if="loadingUserActivities"
        >
          <a-spin tip="加载用户动态中..."></a-spin>
        </div>
        <template v-else>
          <a-empty
            v-if="activities.length === 0"
            description="暂无动态"
          ></a-empty>
          <a-timeline v-else>
            <user-activity-card
              v-for="act in activities"
              :key="act.createTime"
              :activity="act"
            />
            <a-timeline-item v-show="page === pageTotal">
              <template #dot>
                <local-two theme="outline" size="16" />
              </template>
              <span class="user-center__activity-nomoredot-text m-t-6"
                >找不到更早的动态了，就让以前随风而逝吧…</span
              >
            </a-timeline-item>
          </a-timeline>
        </template>
        <div class="flex-row jyct-center anis-center" v-show="page < pageTotal">
          <a-button @click="fetchUserActivity">加载更多</a-button>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { EnvironmentOutlined, ProfileOutlined } from "@ant-design/icons-vue";
import { LocalTwo } from '@icon-park/vue-next';
import { fusions } from "@/fusions";
import { usePayloadFromToken, userDetailsStorageRef, userAvatarUrlFix } from '@/utils'
import { message } from "ant-design-vue";
import CommonHeader from "@/components/view-header/common-header.vue";
import UserActivityCard from '@/components/page-user-center/user-activity-card.vue';
import us from 'underscore';
import type { OrgSimpleDto, UserActivityDto, UserDetailsFullDto } from '@/models'

const userDetails = reactive({
  avatarURL: "",
  introduce: "",
  address: "",
  profession: "",
  followersCount: 0,
  followingsCount: 0,
});
const route = useRoute();
const router = useRouter();
const userName = route.params['userName'] as string;
const isMe = usePayloadFromToken()?.userName === userName || false;
const focused = ref(false);
const joinedOrgs = ref<OrgSimpleDto[]>([]);
const activities = ref<UserActivityDto[]>([]);
const loadingUserActivities = ref(false);
const page = ref(0);
const pageTotal = ref(0);

// 获取 用户详细信息
(async () => {
  let requestURL = `/details/?userName=${userName}`;
  const credential = usePayloadFromToken();
  if (credential) {
    // 已经登录
    requestURL += `&readerId=${credential.userId}`;
  }
  const detailRes = await fusions.get(requestURL);
  if (detailRes.data.responseOk) {
    const { avatarURL, introduce, address,
      profession, followersCount, followingsCount, isFollowing
    } = detailRes.data.data as UserDetailsFullDto;

    userDetails.avatarURL = avatarURL;
    userDetails.introduce = introduce;
    userDetails.address = address;
    userDetails.profession = profession;
    userDetails.followersCount = followersCount;
    userDetails.followingsCount = followingsCount;
    focused.value = isFollowing;

    if (isMe) {
      userDetailsStorageRef.value = userDetails;
    }
  }
})();

// 获取 加入的团队
(async () => {
  const joinedOrgsRes = await fusions.get(`/user/joinedOrgs?userName=${userName}`);
  if (joinedOrgsRes.data.responseOk) {
    joinedOrgs.value = joinedOrgsRes.data.data;
  }
})();

// 获取 用户的动态
const fetchUserActivity = async () => {
  if (page.value === 0) {
    loadingUserActivities.value = true;
  } else {
    message.loading({ key: 'fetch-user-activity', content: '获取更多用户动态中...' });
  }
  const UserActivitiesRes = await fusions.get(`/activity/?userName=${userName}&pageNum=${page.value}`);
  if (UserActivitiesRes.data.responseOk) {
    activities.value.push(...UserActivitiesRes.data.data.activities);

    if (page.value === 0) {
      pageTotal.value = UserActivitiesRes.data.data.pageTotal;
      loadingUserActivities.value = false;
    }
    message.destroy();
    page.value += 1;
  }
}
fetchUserActivity();

// @Methods:
const onFollowUser = us.debounce(() => {
  const credential = usePayloadFromToken();
  if (!credential) {
    message.warn({
      content: "请先登录后再执行本操作",
      key: 'follow-user-message-tip'
    });
    router.push('/login');
    return;
  }

  fusions.post('/user/follow', {
    srcUid: credential.userId,
    targetUserName: userName
  }).then((resp) => {
    if (resp.data.responseOk) {
      message.success({
        content: `${focused.value ? '取消关注' : '关注'} ${userName} 成功！`,
        key: 'follow-user-message-tip'
      });
      if (focused.value) {
        userDetails.followersCount -= 1;
        focused.value = false;
      } else {
        userDetails.followersCount += 1;
        focused.value = true;
      }
    }
  })
}, 1500, true);
</script>

<style lang="less">
.page-user-info__wrapper .basic-info-card .ant-card-body {
  width: 100%;
  text-align: center;
}
</style>
<style lang="less" scoped>
@import '@/less/color.less';
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
.user-detail-address,
.user-detail-introduce,
.user-center__activity-nomoredot-text {
  color: @N500;
  user-select: none;
}

.user-activity-loading {
  height: 200px;
}
</style>
