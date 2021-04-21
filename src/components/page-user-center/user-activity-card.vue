<template>
  <a-timeline-item>
    <template #dot>
      <good-two
        v-if="activity.activityType === UserActivityType.THUMBS_UP_DOC"
        theme="outline"
        size="16"
      />
      <people
        v-else-if="activity.activityType === UserActivityType.FOCUS_USER"
        theme="outline"
        size="16"
      />
      <rss
        v-else-if="activity.activityType === UserActivityType.FOCUS_WIKI"
        theme="outline"
        size="16"
      />
      <writing-fluently
        v-else-if="activity.activityType === UserActivityType.CREATE_DOC"
        theme="outline"
        size="16"
      />
      <newlybuild
        v-else-if="activity.activityType === UserActivityType.CREATE_WIKI"
        theme="outline"
        size="16"
      />
      <Peoples
        v-else-if="activity.activityType === UserActivityType.CREATE_ORG"
        theme="outline"
        size="16"
      />
    </template>

    <div class="user-center-activity-card__wrapper flex-col m-l-6">
      <!-- 动态描述 -->
      <div class="user-center-activity-card__title flex-row anis-center">
        <span v-if="activity.activityType === UserActivityType.THUMBS_UP_DOC">点赞了文档</span>
        <span v-else-if="activity.activityType === UserActivityType.FOCUS_USER">关注了用户</span>
        <span v-else-if="activity.activityType === UserActivityType.FOCUS_WIKI">关注了知识库</span>
        <span v-else-if="activity.activityType === UserActivityType.CREATE_DOC">创建了文档</span>
        <span v-else-if="activity.activityType === UserActivityType.CREATE_WIKI">创建了知识库</span>
        <span v-else-if="activity.activityType === UserActivityType.CREATE_ORG">创建了团队</span>

        <span class="m-l-auto m-r-16">{{ timeDisplay(activity.createTime) }}</span>
      </div>

      <!-- 动态内容 -->
      <div class="user-center-activity-card__content m-t-6">
        <!-- 点赞文档 -->
        <template v-if="activity.activityType === UserActivityType.THUMBS_UP_DOC">
          <div
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img class="m-r-14" src="/assets/svg/dashboard__doc-icon.svg" alt="doc" width="24" />
            <span class="like-doc-title to-ellipsis">{{ doc_dto(activity.activityData).title }}</span>
            <span class="m-l-auto">
              来自：
              <a
                class="like-doc-creator"
                :href="`/user/${doc_dto(activity.activityData).creator.userName}`"
              >{{ doc_dto(activity.activityData).creator.userName }}</a>
            </span>
          </div>
        </template>

        <!-- 关注用户 -->
        <template v-else-if="activity.activityType === UserActivityType.FOCUS_USER">
          <div
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <a-avatar
              class="focus-user-avatar"
              :src="user_dto(activity.activityData).userDetails.avatarURL || '/assets/svg/user-avatar__default.svg'"
            ></a-avatar>
            <div class="focus-info user flex-col m-l-16">
              <a
                class="focus-name"
                :href="`/user/${user_dto(activity.activityData).userName}`"
              >{{ user_dto(activity.activityData).userName }}</a>
              <p
                class="focus-desc"
              >{{ user_dto(activity.activityData).userDetails.introduce || '用户暂未填写个人简介' }}</p>
            </div>
            <div
              class="m-l-auto to-ellipsis"
            >{{ user_dto(activity.activityData).followersCount || 0 }} 人关注</div>
          </div>
        </template>

        <!-- 关注知识库 -->
        <template v-else-if="activity.activityType === UserActivityType.FOCUS_WIKI">
          <div
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img class="m-r-14" src="/assets/svg/dashboard__wiki-icon.svg" alt="doc" width="24" />
            <div class="focus-info wiki flex-col m-l-16">
              <a
                class="focus-name"
                :href="`/wiki/${wiki_dto(activity.activityData).id}`"
              >{{ wiki_dto(activity.activityData).name }}</a>
              <p class="focus-desc">{{ wiki_dto(activity.activityData).description || '该知识库暂无简介' }}</p>
            </div>
            <div
              class="m-l-auto to-ellipsis"
            >{{ wiki_dto(activity.activityData).focusCount || 0 }} 人关注</div>
          </div>
        </template>

        <!-- 发表文章 -->
        <template v-else-if="activity.activityType === UserActivityType.CREATE_DOC">
          <div class="user-center-activity-card__content-item flex-col p-16 m-tb-6 brr-10">
            <a
              class="fs-18 fw-500 publish-doc-title m-b-12"
              :href="`/doc/${doc_dto(activity.activityData).id}`"
            >{{ doc_dto(activity.activityData).title }}</a>
            <p
              class="publish-doc-desc"
            >{{ doc_dto(activity.activityData).contentAbstract || '该文档还没有摘要...' }}</p>
          </div>
        </template>

        <!-- 关注知识库 -->
        <template v-else-if="activity.activityType === UserActivityType.CREATE_WIKI">
          <div
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img class="m-r-14" src="/assets/svg/dashboard__wiki-icon.svg" alt="doc" width="24" />
            <div class="focus-info wiki flex-col m-l-16">
              <a
                class="focus-name"
                :href="`/wiki/${wiki_dto(activity.activityData).id}`"
              >{{ wiki_dto(activity.activityData).name }}</a>
              <p class="focus-desc">{{ wiki_dto(activity.activityData).description || '该知识库暂无简介' }}</p>
            </div>
            <div
              class="m-l-auto to-ellipsis"
            >{{ wiki_dto(activity.activityData).focusCount || 0 }} 人关注</div>
          </div>
        </template>

        <!-- 创建团队 -->
        <template v-else-if="activity.activityType === UserActivityType.CREATE_ORG">
          <div
            class="user-center-activity-card__content-item flex-row anis-center p-16 m-tb-6 brr-10"
          >
            <img
              class="org-avatar m-r-20"
              :src="org_dto(activity.activityData).avatarURL || '/assets/svg/org-avatar__default.svg'"
              alt="团队头像"
            />
            <div class="flex-col">
              <div class="fs-16 fw-500 tc-black">{{ org_dto(activity.activityData).name }}</div>
              <p class="tc-n500">{{ org_dto(activity.activityData).desc || '该团队暂时还没有简介...' }}</p>
            </div>
            <div class="tc-n500 m-l-auto">{{ org_dto(activity.activityData).memberCount || 0 }} 名成员</div>
          </div>
        </template>
      </div>
    </div>
  </a-timeline-item>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { GoodTwo, WritingFluently, Rss, People, Newlybuild, Peoples } from '@icon-park/vue-next';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime);
import { UserActivityType } from '@/models';
import type {
  OrgSimpleDTO,
  DocSimpleDto,
  UserActivity,
  UserActivityData,
  UserSimpleDTO,
  WikiSimpleDto,
} from "@/models";

defineProps<{
  activity: UserActivity
}>();

const timeDisplay = (timestamp: number) => {
  return dayjs(timestamp).locale('zh-cn').format("YYYY-MM-DD A h:mm");
}

const doc_dto = (data: UserActivityData) => data as DocSimpleDto;
const user_dto = (data: UserActivityData) => data as UserSimpleDTO;
const wiki_dto = (data: UserActivityData) => data as WikiSimpleDto;
const org_dto = (data: UserActivityData) => data as OrgSimpleDTO;
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

.org-avatar {
  width: 50px;
  height: 50px;
  border-radius: 100%;
}
</style>
