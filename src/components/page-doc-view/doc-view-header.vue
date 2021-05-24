<template>
  <div class="page-document-view__header flex-row anis-center">
    <div class="flex-row anis-center p-l-24 p-r-16">
      <a v-show="!editing" href="/">
        <img
          src="/assets/img/Icon-png-logo.png"
          alt="header-logo"
          height="48"
          class="m-r-24"
        />
      </a>
      <a-breadcrumb v-if="viewData">
        <!-- 作者用户名 -->
        <a-breadcrumb-item>
          <a
            :href="`/user/${viewData.creator.userName}`"
            class="page-document-view__header-breadcrumb"
            >{{ viewData.creator.userName }}</a
          >
        </a-breadcrumb-item>

        <!-- 如果在知识库中 显示知识库名称 -->
        <a-breadcrumb-item v-if="viewData.inWiki">
          <a
            :href="`/wiki/${viewData.inWiki.id}`"
            class="page-document-view__header-breadcrumb"
            >{{ viewData.inWiki.name }}</a
          >

          <a-tooltip title="私密知识库" placement="bottom">
            <lock
              theme="filled"
              size="14"
              class="page-document-view__header-breadcrumb-lock iconpark m-l-10"
              v-show="viewData.inWiki.isPrivate"
            />
          </a-tooltip>
        </a-breadcrumb-item>

        <!-- 显示文档标题 -->
        <a-breadcrumb-item>
          <span class="fs-15 fw-500 text-noselect">{{
            viewData.title || '未输入文章标题...'
          }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 在线用户列表 -->
    <div
      v-if="editing && onlineUsers"
      class="flex-row anis-center p-lr-6 m-l-auto m-r-10"
    >
      <a-badge
        v-for="user in onlineUsers.slice(0, 8)"
        :key="user.userId"
        :numberStyle="{
          width: '8px',
          height: '8px'
        }"
        class="cursor-ptr"
        :color="user.color"
        @click="$router.push(`/user/${user.userName}`)"
      >
        <a-tooltip :title="user.userName" placement="bottom">
          <a-avatar
            shape="circle"
            :src="user.avatarURL || `/assets/svg/user-avatar__default.svg`"
          ></a-avatar>
        </a-tooltip>
      </a-badge>
    </div>

    <div
      v-if="!consice"
      class="flex-row anis-center p-r-24"
      :class="{
        'm-l-auto': !editing
      }"
    >
      <a-tooltip title="添加协作用户" placement="bottom">
        <people-plus
          theme="outline"
          :size="20"
          class="iconpark m-l-10 m-r-4 cursor-ptr"
          @click="showInviteModal = true; $emit('inviting')"
        />
      </a-tooltip>
      <DocInviteModal
        :showInviteModal="showInviteModal"
        :viewData="viewData"
        @modal-close="showInviteModal = false"
      />

      <a-button class="m-lr-10" v-show="!editing">分享阅读</a-button>
      <template v-if="editable || editing">
        <a-button
          class="m-lr-10"
          v-if="!editing"
          type="primary"
          @click="onDocumentEdit"
          >编辑</a-button
        >
        <a-button class="m-lr-10" v-else @click="quitDocumentEdit"
          >保存并退出编辑</a-button
        >
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmit, defineProps, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Lock, PeoplePlus } from '@icon-park/vue-next';
import { editingDocViewData, savedDocViewData } from '@/pages/document/editing-doc-storage-ref';
import DocInviteModal from './doc-invite-modal.vue';
import type { OnlineUser } from '../BibEditor/typings';
import type { DocumentViewData, UserSimpleDto } from '@/models';

const props = defineProps<{
  editing?: boolean;
  editable?: boolean;
  consice?: boolean;
  viewData?: DocumentViewData,
  onlineUsers?: OnlineUser[]
}>()
const emit = defineEmit([
  'quit-document-edit',
  'inviting'
]);

// @States:
const router = useRouter(), route = useRoute();
const docId = route.params.docId as string;
const showInviteModal = ref(false);

// @LifeCycles:

// @Methods:
const onDocumentEdit = () => {
  editingDocViewData.value =
    props.viewData
    ?? savedDocViewData.value[docId]
    ?? null;
  router.push(`${route.path}/edit`);
}
const quitDocumentEdit = () => {
  emit('quit-document-edit');
}
</script>

<style lang="less" scoped>
@import '@/less/color.less';
@import '@/less/shared.less';

.page-document-view__header {
  .header-container;
}
.page-document-view__header-breadcrumb {
  color: @N600;
  &:hover {
    color: @primary-color;
  }
}
</style>
