<template>
  <a-modal
    v-model:visible="showInviteModal"
    title="邀请新用户参与协作"
    :width="630"
    @ok="$emit('modal-close')"
    @cancel="$emit('modal-close')"
  >
    <a-tabs v-model:activeKey="modalTabKey" :animated="false">
      <a-tab-pane key="1" tab="邀请用户加入协作">
        <!-- 要邀请的用户::输入栏： -->
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

        <!-- 找到的用户列表： -->
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
      </a-tab-pane>

      <a-tab-pane key="2" tab="待处理的请求访问">
        <template
          v-if="
            viewData?.pendingRequests && viewData.pendingRequests.length > 0
          "
        >
          <div
            v-for="user in viewData?.pendingRequests"
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
              @click="passJoinRequests(user)"
              >{{ isAlreadyInvited(user.uid) ? '已通过' : '通过' }}</a-button
            >
          </div>
        </template>
        <a-empty v-else class="m-tb-48" description="还没有申请访问的请求..." />
      </a-tab-pane>
    </a-tabs>

    <h3 class="fw-300 m-b-2 m-t-32">已参与协作的用户</h3>
    <a-divider class="m-tb-4" />
    <div
      v-for="user in collaborators"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { userAvatarUrlFix } from '@/utils';
import { Search } from '@icon-park/vue-next';
import { fusions } from '@/fusions';
import us from 'underscore';
import type { DocumentViewData, UserSimpleDto } from '@/models';
import { message } from 'ant-design-vue';

const props = defineProps<{
  showInviteModal: boolean;
  viewData?: DocumentViewData;
}>();
defineEmits(['modal-close']);

// @States:
const showInviteSearchLoading = ref(false);
const inviteModalInputName = ref('');
const foundUserByName = ref<UserSimpleDto[]>([]);
const invitedUserCache = ref<UserSimpleDto[]>([]);
const modalTabKey = ref('1');
const collaborators = computed(() =>
  (props.viewData?.collaborators || [])
    .concat(invitedUserCache.value)
);

// @Methods:
const isAlreadyInvited = (uid: number) => {
  return collaborators.value.map(u => u.uid).includes(uid);
};
const onInviteUser = (inviteUser: UserSimpleDto) => {
  fusions.patch(`/docs/collaborators?docId=${props.viewData!.id}&invitingUserId=${inviteUser.uid}`)
    .then((resp) => {
      if (resp.data.responseOk) {
        invitedUserCache.value.push(inviteUser);
      }
    });
};
const searchUserByName = us.debounce(() => {
  fusions.get(`/user/seekAllUserByName?userName=${inviteModalInputName.value}`)
    .then((resp) => {
      foundUserByName.value = resp.data.responseOk ? resp.data.data : [];
      showInviteSearchLoading.value = false;
    });
}, 1500, false);
const passJoinRequests = (user: UserSimpleDto) => {
  fusions.patch(`/docs/joinCollaborationRequest?docId=${
    props.viewData!.id
  }&userId=${user.uid}`)
    .then((resp) => {
      if (resp.data.responseOk) {
        message.success(`用户 ${user.userName} 已成功加入协作中！`);
        invitedUserCache.value.push(user);
      }
    });
};
</script>

<style lang="less" scoped></style>
