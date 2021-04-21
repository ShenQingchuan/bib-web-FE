<template>
  <common-header consice />
  <center-big-card-layout
    class="page-new-org__wrapper"
    title="新建团队"
    description="和团队成员一起编写文档、交流想法、沉淀经验"
  >
    <template #center>
      <div class="page-new-org__form p-tb-32 p-l-10 p-r-32 flex-1">
        <!-- 团队名称 -->
        <div class="page-new-org__form-item name flex-col m-b-32">
          <div class="page-new-org__form-label p-lr-2 m-b-6">
            <label for="orgName">团队名称</label>
          </div>
          <a-input name="orgName" v-model:value="orgName" placeholder="请输入团队名称"></a-input>
        </div>

        <!-- 团队描述 -->
        <div class="page-new-org__form-item desc flex-col m-b-32">
          <div class="page-new-org__form-label p-lr-2 m-b-6">
            <label for="orgName">团队简介</label>
          </div>
          <a-textarea name="orgDesc" v-model:value="orgDesc" placeholder="请输入团队简介"></a-textarea>
        </div>

        <div class="page-new-org__form-item avatar-upload flex-col m-b-32">
          <div class="page-new-org__form-label p-lr-2 m-b-6">
            <label for="orgName">上传头像</label>
          </div>
          <div class="flex-row anis-center">
            <img
              class="avatar-display"
              :src="orgAvatarURL || '/assets/svg/org-avatar__default.svg'"
              alt="团队头像"
            />
            <div class="flex-col jyct-center m-l-32">
              <a-button class="m-t-10" @click="onUploadBtnClick">
                <UploadOutlined />上传头像
              </a-button>
              <p class="tc-n500 fs-12 m-t-10">请从本地选择 JPG/PNG 图片作头像上传</p>
              <input
                class="hidden"
                type="file"
                ref="org-avatar-uploader"
                id="org-avatar-uploader"
                accept="image/jpeg, image/jpg, image/png"
                @change="onAvatarUpload"
              />
            </div>
          </div>
        </div>

        <a-button
          type="primary"
          block
          :disabled="!isFormValid"
          @click="onCreateOrgFormSubmit"
        >立 即 创 建</a-button>
      </div>

      <div class="page-new-org__illustration flex-col p-lr-20 m-l-32">
        <h3>将文档放入团队</h3>
        <div class="tc-n500 m-b-32">
          邀请好友创作和交流，共享知识精华，轻松同步协作。
          <br />
          <br />构建属于您团队的专享团队
          <br />不积跬步无以至千里，不积细流无以成江海。
        </div>
        <img class="m-t-32 m-lr-auto" src="/assets/svg/new-org_illustration.svg" alt="新建团队" />
      </div>
    </template>
  </center-big-card-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { templateRef } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { fusions } from '@/fusions';
import { cosImageUploadLoadingKey, cosImageURLPrefix, multiplePartFormContentType, usePayloadFromToken } from '@/utils';
import CommonHeader from '@/components/view-header/common-header.vue'
import CenterBigCardLayout from '@/components/layouts/center-big-card-layout.vue';
import type { OrgSimpleDTO } from '@/models';

const tokenPayload = usePayloadFromToken()!;
const router = useRouter()

// @States:
const orgName = ref('');
const orgDesc = ref('');
const orgAvatarUploadInputer = templateRef<HTMLInputElement>('org-avatar-uploader');
const orgAvatarURL = ref('');

const isFormValid = computed(() => orgName.value.length > 0);

// @LifeCycels:

// @Methods:
const onUploadBtnClick = () => {
  orgAvatarUploadInputer.value.click();
}
const onAvatarUpload = () => {
  const avatarFile = orgAvatarUploadInputer.value.files?.[0];
  if (avatarFile) {
    let formData = new FormData();
    formData.append("userId", `${tokenPayload.userId}`);
    formData.append("avatarFile", avatarFile);
    message.loading({
      content: '头像上传中，请稍候...',
      key: cosImageUploadLoadingKey
    });
    fusions.post('/org/uploadAvatar', formData, {
      headers: {
        "Content-Type": multiplePartFormContentType,
      }
    }).then((resp) => {
      if (resp.data.responseOk) {
        const r: { key: string, putObjectResult: any } = resp.data.data[0];
        orgAvatarURL.value = `${cosImageURLPrefix}${r.key}`;
        message.success({
          content: resp.data.message,
          key: cosImageUploadLoadingKey
        });
      }
    });
  }
}
const onCreateOrgFormSubmit = () => {
  message.loading({ content: "创建团队中，请稍候...", key: 'create-org' });
  const form = {
    name: orgName.value,
    desc: orgDesc.value,
    avatarURL: orgAvatarURL.value,
    creatorUid: tokenPayload.userId
  };
  fusions.post('/org/', form).then((resp) => {
    if (resp.data.responseOk) {
      const newOrg: OrgSimpleDTO = resp.data.data;
      message.success({ content: "创建团队成功", key: 'create-org' });
      router.push(`/org/${newOrg.id}`);
    }
  })
}
</script>

<style lang="less" scoped>
@import "@/less/shared.less";

.center-big-card-layout-common(org);

img.avatar-display {
  width: 60px;
  height: 60px;
  border-radius: 100%;
}
</style>
