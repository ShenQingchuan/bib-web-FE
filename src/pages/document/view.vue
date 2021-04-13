<template>
  <div class="page-document-view__wrapper flex-col">
    <doc-view-header :doc-data="docData" />

    <!-- 通过 readonly ProseMirror 加载出文档 -->
    <div class="page-document-view__content">
      <a-skeleton class="m-t-40" active v-if="loadingDocData" :paragraph="{ rows: 20 }" />
      <div v-show="!loadingDocData" ref="docViewRef"></div>
    </div>

    <div v-if="!loadingDocData" class="page-document-view__meta-section m-t-32 m-b-64">
      <!-- 点赞 -->
      <div
        class="page-document-view__thumbs-up-btn flex-row jyct-center anis-center m-lr-auto"
        :class="{
          'active': thumbsUped
        }"
        @click="onStarDocument"
      >
        <thumbs-up :theme="thumbsUped ? 'filled' : 'outline'" :size="24" class="iconpark" />
      </div>
      <div
        class="page-document-view__thumbs-up-divider m-lr-auto m-tb-20"
      >点赞 {{ thumbsUpedCount }} 人</div>

      <!-- 评论 -->
      <div class="page-document-view__comments p-20 m-lr-auto">
        <doc-comment
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @reply-to="onReplyTo"
        />
        <a-input
          ref="commentInputer"
          class="page-document-view__comment-inputer"
          size="large"
          v-model:value="commentContent"
          :placeholder="replyTo
          ? `回复 ${replyTo.creator.userName}：`
          : (userTokenPayload
            ? '评论文章，按回车键提交...'
            : '请登录后评论...'
          )"
          @press-enter="onSubmitComment"
          :disabled="!userTokenPayload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { templateRef } from "@vueuse/core";
import { useRoute } from 'vue-router';
import { ThumbsUp } from '@icon-park/vue-next';
import { mocker } from '../../fusions';
import { useEditor } from "../../components/BibEditor/composable/useEditor";
import { usePayloadFromToken, userDetailsStorageRef } from "../../utils";
import DocViewHeader from '../../components/page-doc-view/doc-view-header.vue';
import DocComment from '../../components/page-doc-view/doc-comment.vue';
import * as us from 'underscore';
import type { DocumentComment, DocumentViewData, UserSimpleDTO } from "../../models";

// @States:
const route = useRoute();
const docId = route.params.docId as string;
const credential = usePayloadFromToken()!;
const loadingDocData = ref(false);
const docViewRef = templateRef('docViewRef');
const userTokenPayload = usePayloadFromToken();
const commentInputer = templateRef<HTMLInputElement>('commentInputer');

// @States:
const docData = ref<DocumentViewData>();
const comments = ref<DocumentComment<UserSimpleDTO>[]>([]);
const commentContent = ref('');
const thumbsUped = ref(false);
const thumbsUpedCount = ref(0);
const replyTo = ref<DocumentComment<UserSimpleDTO> | null>(null);

// @LifeCycles:
(async () => {
  loadingDocData.value = true;
  const resp = await mocker.get(`/document/${docId}`);
  if (resp.data.responseOk) {
    docData.value = resp.data.data;

    // 存储一部分组件在本地使用渲染用的、有离线需求的数据
    comments.value = docData.value!.comments;
    thumbsUped.value = docData.value!.thumbsUped;
    thumbsUpedCount.value = docData.value!.thumbUpUsers.length;

    const x = useEditor({
      initContent: docData.value!.content,
      docName: `doc-${docData.value!.id}-${docData.value!.title}`,
      readonly: true,
      credential
    });
    x.initEditor(docViewRef.value);

    loadingDocData.value = false;
  }
})();

// @Methods:
const onReplyTo = (replyToPayload: DocumentComment<UserSimpleDTO>) => {
  replyTo.value = replyToPayload;
  commentInputer.value.focus();
}
const onStarDocument = () => {
  thumbsUped.value = !thumbsUped.value;
  if (thumbsUped.value) thumbsUpedCount.value += 1; else thumbsUpedCount.value -= 1;

  // TODO: 提交加星收藏请求 - 防抖 immediate
}
const onSubmitComment = () => {
  const nowTime = new Date();

  // TODO: 等待替换 - 实际逻辑应该是后端存储完成返回前端再显示
  comments.value.push({
    id: NaN,
    creator: {
      uid: userTokenPayload!.userId,
      userName: userTokenPayload!.userName,
      userDetails: us.pick(userDetailsStorageRef.value, 'avatarURL')
    },
    thumbUpUsers: [],
    replyTo: replyTo.value?.creator || null,
    content: commentContent.value,
    createTime: nowTime,
    updateTime: nowTime,
  });
  // ----- dev

  commentContent.value = "";
  commentInputer.value.blur();
}
</script>

<style lang="less" scoped>
@import "../../less/color.less";
@import "../../less/shared.less";
.page-document-view__content {
  width: 60vw;
  margin: 60px auto 0 auto;
}

.page-document-view__meta-section {
  width: 100vw;
}
.page-document-view__thumbs-up-btn {
  border-radius: 50%;
  width: 64px;
  height: 64px;
  border: 1px solid @primary-color;
  cursor: pointer;
  color: @primary-color;

  &:hover,
  &.active {
    border: 1px solid @Y600;
    color: @Y600;
    transition: all ease-in-out 0.2s;
  }
}
.page-document-view__thumbs-up-divider {
  width: 200px;
  text-align: center;
  position: relative;
  white-space: nowrap;
  color: @N500;

  &::before,
  &::after {
    content: "";
    width: 50px;
    height: 1px;
    position: absolute;
    border-top: 1px solid @N300;
  }
  &::before {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  }
  &::after {
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.page-document-view__comments {
  width: 60%;
}
.page-document-view__comment-inputer {
  &:hover::-webkit-input-placeholder,
  &:focus::-webkit-input-placeholder {
    transition: color ease 0.5s;
    color: @primary-color;
  }
}
</style>
