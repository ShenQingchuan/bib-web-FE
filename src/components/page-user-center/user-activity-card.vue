<template>
  <a-timeline-item>
    <template #dot>
      <good-two v-if="activity.activityType === 'LIKE_DOC'" theme="outline" size="16" />
      <people v-else-if="activity.activityType === 'FOCUS_USER'" theme="outline" size="16" />
      <rss v-else-if="activity.activityType === 'FOCUS_WIKI'" theme="outline" size="16" />
      <writing-fluently
        v-else-if="activity.activityType === 'PUBLISH_DOC'"
        theme="outline"
        size="16"
      />
    </template>
    <div class="user-center-activity-card__wrapper flex-col m-l-6">
      <!-- 动态描述 -->
      <div class="user-center-activity-card__title flex-row anis-center">
        <span
          v-if="activity.activityType === 'LIKE_DOC'"
        >点赞了{{ getMultipleActivitiesCount(activity, '篇') }}文档</span>
        <span
          v-else-if="activity.activityType === 'FOCUS_USER'"
        >关注了{{ getMultipleActivitiesCount(activity, '名') }}用户</span>
        <span
          v-else-if="activity.activityType === 'FOCUS_WIKI'"
        >关注了{{ getMultipleActivitiesCount(activity, '个') }}知识库</span>
        <span v-else-if="activity.activityType === 'PUBLISH_DOC'">发布了文章</span>

        <span class="m-l-auto m-r-16">{{ timeFromNow(activity.activityTime) }}</span>
      </div>

      <!-- 动态内容 -->
      <div class="user-center-activity-card__content m-t-6">
        <!-- 点赞文档 -->
        <template v-if="activity.activityType === 'LIKE_DOC'">
          <div
            v-for="doc in activity.activityData"
            :key="doc.id"
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img class="m-r-14" src="/assets/svg/dashboard__doc-icon.svg" alt="doc" width="24" />
            <span class="like-doc-title to-ellipsis">{{ doc.title }}</span>
            <span class="m-l-auto">
              来自：
              <a
                class="like-doc-creator"
                :href="`/user/${doc.creator.userName}`"
              >{{ doc.creator.userName }}</a>
            </span>
          </div>
        </template>

        <!-- 关注用户 -->
        <template v-else-if="activity.activityType === 'FOCUS_USER'">
          <div
            v-for="user in activity.activityData"
            :key="user.uid"
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <a-avatar
              class="focus-user-avatar"
              :src="user.userDetails.avatarURL || '/assets/svg/user-avatar__default.svg'"
            ></a-avatar>
            <div class="focus-info user flex-col m-l-16">
              <a class="focus-name" :href="`/user/${user.userName}`">{{ user.userName }}</a>
              <p class="focus-desc">{{ user.userDetails.introduce || '用户暂未填写个人简介' }}</p>
            </div>
            <div class="m-l-auto to-ellipsis">{{ user.followerCount }} 人关注</div>
          </div>
        </template>

        <!-- 关注知识库 -->
        <template v-else-if="activity.activityType === 'FOCUS_WIKI'">
          <div
            v-for="wiki in activity.activityData"
            :key="wiki.id"
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img class="m-r-14" src="/assets/svg/dashboard__wiki-icon.svg" alt="doc" width="24" />
            <div class="focus-info wiki flex-col m-l-16">
              <a class="focus-name" :href="`/wiki/${wiki.id}`">{{ wiki.name }}</a>
              <p class="focus-desc">{{ wiki.description || '该知识库暂无简介' }}</p>
            </div>
            <div class="m-l-auto to-ellipsis">{{ wiki.focusCount }} 人关注</div>
          </div>
        </template>

        <!-- 发表文章 -->
        <template v-else-if="activity.activityType === 'PUBLISH_DOC'">
          <div class="user-center-activity-card__content-item flex-col p-16 m-tb-6 brr-10">
            <a
              class="fs-18 fw-500 publish-doc-title m-b-12"
              :href="`/doc/${t_publishDoc(activity).activityData.id}`"
            >{{ t_publishDoc(activity).activityData.title }}</a>
            <p class="publish-doc-desc">{{ t_publishDoc(activity).activityData.contentAbstract }}</p>
          </div>
        </template>
      </div>
    </div>
  </a-timeline-item>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { GoodTwo, WritingFluently, Rss, People } from '@icon-park/vue-next';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import type { UserActivity } from '../../models'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime);

defineProps<{
  activity: UserActivity
}>();

// UserActivity type helper:
const t_publishDoc = (activity: UserActivity<'PUBLISH_DOC'>) => activity;

const getMultipleActivitiesCount = (activity: UserActivity, unit: string) =>
  ` ${(activity.activityData as any[]).length} ${unit}` || '';

const timeFromNow = (timestamp: number) => {
  return dayjs(timestamp).locale('zh-cn').fromNow();
}
</script>

<style lang="less" scoped>
@import "../../less/color.less";

.user-center-activity-card__title {
  color: @N500;
}
.user-center-activity-card__content {
  &-item {
    color: @N500;
    background-color: #fafafa;
  }
}

.like-doc-creator:hover {
  text-decoration: none;
}

.focus-info {
  position: relative;
  width: 100%;
  flex: 1;
}
.publish-doc-title,
.focus-name {
  color: @N700;
}
.focus-desc {
  margin-top: 8px;
  margin-bottom: 0;
  color: #8c8c8c;
}
</style>
