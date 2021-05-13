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
          @click="showInviteModal = true"
        />
      </a-tooltip>
      <a-modal
        v-model:visible="showInviteModal"
        title="邀请新用户参与协作"
        :width="630"
        @ok="showInviteModal = false"
      >
        <div class="invite-collaborators-modal__body flex-col">
          <a-form>
            <a-form-item
              :labelCol="{ span: 5 }"
              labelAlign="left"
              :colon="false"
              :wrapperCol="{
                span: 18
              }"
              :style="{ lineHeight: 1 }"
            >
              <template #label>
                <div class="invite-collaborators-modal__form-item-label">
                  <Search class="iconpark" />
                  <span class="m-lr-10 fw-500">搜索用户名</span>
                </div>
              </template>
              <a-input
                v-model:value="inviteModalInputName"
                @input="
                  showInviteSearchLoading = true;
                  searchUserByName();
                "
              ></a-input>
            </a-form-item>
          </a-form>
        </div>

        <h3 class="fw-300 m-b-2">找到以下用户</h3>
        <a-divider class="m-tb-4" />
        <template v-if="foundUserByName.length > 0">
          <div
            v-for="user in foundUserByName"
            :key="user.uid"
            class="flex-row anis-center p-tb-6"
          >
            <a-avatar
              :src="userAvatarUrlFix(user.userDetails.avatarURL)"
              shape="circle"
            />
            <span class="m-lr-10 tc-n600">{{ user.userName }}</span>
            <a-button
              class="m-r-16 m-l-auto"
              :disabled="isAlreadyInvited(user.uid)"
              @click="onInviteUser(user)"
              >{{ isAlreadyInvited(user.uid) ? '已邀请' : '邀请' }}</a-button
            >
          </div>
        </template>
        <a-spin
          v-else-if="showInviteSearchLoading"
          class="w-p100 m-tb-32"
          tip="搜索中，请稍候..."
        />
        <a-empty v-else class="m-tb-48" description="未找到要搜索的用户..." />

        <h3 class="fw-300 m-b-2 m-t-32">已经邀请的用户</h3>
        <a-divider class="m-tb-4" />
        <div
          v-for="user in viewData?.collaborators.concat(invitedUserCache)"
          :key="user.uid"
          class="flex-row anis-center p-tb-6"
        >
          <a-avatar
            :src="userAvatarUrlFix(user.userDetails.avatarURL)"
            shape="circle"
          />
          <span class="m-lr-10 tc-n600">{{ user.userName }}</span>
        </div>
      </a-modal>

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
import { computed, defineEmit, defineProps, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Lock, PeoplePlus, Search } from '@icon-park/vue-next';
import { editingDocViewData, savedDocViewData } from '@/pages/document/editing-doc-storage-ref';
import { fusions } from '@/fusions';
import { userAvatarUrlFix } from '@/utils';
import us from 'underscore';
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
  'quit-document-edit'
]);

// @States:
const router = useRouter(), route = useRoute();
const docId = route.params.docId as string;
const showInviteModal = ref(false);
const showInviteSearchLoading = ref(false);
const inviteModalInputName = ref('');
const foundUserByName = ref<UserSimpleDto[]>([]);
const invitedUserCache = ref<UserSimpleDto[]>([]);
const collaboratorsUids = computed(() =>
  (props.viewData?.collaborators.map(u => u.uid) || [])
    .concat(invitedUserCache.value.map(u => u.uid))
);

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
const searchUserByName = us.debounce(() => {
  fusions.get(`/user/seekAllUserByName?userName=${inviteModalInputName.value}`)
    .then((resp) => {
      foundUserByName.value = resp.data.responseOk ? resp.data.data : [];
      showInviteSearchLoading.value = false;
    });
}, 1500, false);
const isAlreadyInvited = (uid: number) => {
  return collaboratorsUids.value.includes(uid);
};
const onInviteUser = (inviteUser: UserSimpleDto) => {
  fusions.patch(`/docs/addCollaborator?docId=${props.viewData!.id}&invitingUserId=${inviteUser.uid}`)
    .then((resp) => {
      if (resp.data.responseOk) {
        invitedUserCache.value.push(inviteUser);
      }
    })
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
