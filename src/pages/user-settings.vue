<template>
  <common-header consice />

  <div class="page-user-settings__wrapper m-tb-48 m-lr-auto p-32">
    <a-tabs
      v-model:activeKey="activeTabKey"
      :animated="false"
      @change="onTabChange"
      defaultActiveKey="profile "
    >
      <a-tab-pane key="profile" tab="个人信息">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <!-- 头像 -->
          <a-form-item
            class="page-user-settings__profile-form-item m-tb-20"
            name="avatarURL"
            :colon="false"
          >
            <template #label>
              <div class="fs-14 m-r-16">头像：</div>
            </template>
            <div class="flex-row anis-center">
              <a-avatar
                class="w-80px h-80px m-l-20"
                :src="detailsFormData.avatarURL || '/assets/svg/user-avatar__default.svg'"
              ></a-avatar>
              <div
                class="page-user-settings__profile-upload-avatar flex-row anis-center brr-6 m-l-24"
                @click="userAvatarUploadRef.click()"
              >
                <upload-one class="m-t-12" theme="outline" size="24" />
                <span class="m-l-8">点击上传新头像</span>
                <input
                  type="file"
                  id="userAvatarUpload"
                  ref="userAvatarUploadRef"
                  @change="onAvatarInput"
                />
              </div>
            </div>
          </a-form-item>

          <!-- 地址 -->
          <a-form-item
            class="page-user-settings__profile-form-item m-b-0"
            name="address"
            :colon="false"
          >
            <template #label>
              <div class="fs-14 m-r-16">地址：</div>
            </template>
            <a-input v-model:value="detailsFormData.address"></a-input>
          </a-form-item>

          <!-- 职业 -->
          <a-form-item
            class="page-user-settings__profile-form-item m-b-0"
            name="profession"
            :colon="false"
          >
            <template #label>
              <div class="fs-14 m-r-16">职业：</div>
            </template>
            <a-input v-model:value="detailsFormData.profession"></a-input>
          </a-form-item>

          <!-- 个人简介 -->
          <a-form-item
            class="page-user-settings__profile-form-item m-b-0"
            name="introduce"
            :colon="false"
          >
            <template #label>
              <div class="fs-14 m-r-16">个人简介：</div>
            </template>
            <a-textarea v-model:value="detailsFormData.introduce"></a-textarea>
          </a-form-item>
        </a-form>

        <div class="w-100 flex-row anis-center jyct-center">
          <a-button type="primary" @click="onDetailsSubmit">保存</a-button>
        </div>
      </a-tab-pane>
      <a-tab-pane key="account" tab="账户管理">账户管理</a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { multiplePartFormContentType, userDetailsStorageRef } from "../utils";
import { UploadOne } from '@icon-park/vue-next';
import { templateRef } from '@vueuse/core';
import CommonHeader from '@/components/view-header/common-header.vue';
import { message } from 'ant-design-vue';
import { fusions } from '@/fusions';
import { cosImageUploadLoadingKey, usePayloadFromToken, cosImageURLPrefix } from '@/utils'

// @States:
const activeTabKey = ref(
  window.location.hash.slice(1) // 去掉 '#' 号前缀
  || 'profile'
);
const detailsFormData = userDetailsStorageRef;
const userAvatarUploadRef = templateRef<HTMLInputElement>('userAvatarUploadRef');

// @LifeCycles:

// @Methods:
const onTabChange = (activeKey: string) => {
  window.location.hash = activeKey;
}
const onAvatarInput = () => {
  const tokenPayload = usePayloadFromToken();
  if (tokenPayload && userAvatarUploadRef.value.files) {
    const images = userAvatarUploadRef.value.files;
    let formData = new FormData();

    message.loading({
      content: '头像上传中，请稍候...',
      key: cosImageUploadLoadingKey
    });
    formData.append("uploadImages", images[0]);
    formData.append("userId", `${tokenPayload.userId}`);
    fusions.post('/details/uploadAvatar', formData, {
      headers: {
        "Content-Type": multiplePartFormContentType,
      }
    }).then((res) => {
      message.success({
        content: res.data.message,
        key: cosImageUploadLoadingKey
      });
      const r: { key: string, putObjectResult: any } = res.data.data.newAvatar[0];
      detailsFormData.value.avatarURL = `${cosImageURLPrefix}${r.key}`;
    })
  }
}
const onDetailsSubmit = () => {
  const tokenPayload = usePayloadFromToken();
  if (tokenPayload) {
    fusions.post('/details/', {
      ...detailsFormData.value,
      userId: tokenPayload.userId
    }).then((res) => {
      message.success(res.data.message);
    })
  }
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
.page-user-settings__wrapper {
  width: 100%;
  max-width: 800px;
  border-radius: 10px;
  box-shadow: 0 5px 10px @N300;
}

.page-user-settings__profile-form-item {
  line-height: 30px;
}

.page-user-settings__profile-upload-avatar {
  cursor: pointer;
  color: @N600;
}
#userAvatarUpload {
  display: none;
}
</style>
