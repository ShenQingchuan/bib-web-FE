<template>
  <!-- 访问文档用户需为协作者，若为未登录态则文档必须 publicSharing -->
  <div
    v-if="noReadingAuth"
    class="page-document-view__no-public-sharing-read flex-col jyct-center p-tb-100 m-lr-auto"
  >
    <doc-view-header :view-data="viewData" consice />
    <img
      class="page-document-view__no-read-auth-img m-lr-auto"
      src="/assets/svg/no-auth-to-doc.svg"
      alt="无权查看该文档"
    />
    <div class="page-document-view__no-read-auth-tip m-t-32 m-lr-auto flex-col">
      <span class="p-8 fw-500 fs-24 text-center">
        <FileLock class="iconpark tc-primary" />没有权限访问
      </span>
      <span class="p-t-8 p-b-4 text-center">
        当前登录身份为
        <a
          class="tc-primary"
          :href="logined ? `/user/${credential.userName}` : '/login'"
        >{{ logined ? credential.userName : '未登录' }}</a>
      </span>
      <template v-if="logined">
        <template v-if="!sendedJoinRequest">
          <span class="p-b-8 p-t-4 fs-16 text-center">
            您可以向
            <a
              class="tc-primary fw-500"
              :href="`/user/${viewData?.creator.userName}`"
            >{{ viewData?.creator.userName }}</a>
            申请权限
          </span>
          <div class="flex-row anis-center jyct-center m-tb-16">
            <a-button type="primary" class="m-lr-20" @click="createJoinCollaborationRequest">申请</a-button>
            <a-button class="m-lr-20">取消</a-button>
          </div>
        </template>
        <span v-else class="p-tb-12 tc-n500 text-center fs-16">已经申请权限，请等待回复后刷新页面。</span>
      </template>
    </div>
  </div>

  <!-- 有权限则渲染文档视图 -->
  <div v-else class="page-document-view__wrapper flex-col">
    <doc-view-header :view-data="viewData" :editable="editable" @inviting="updateJoinRequests" />

    <div class="flex-row m-t-100 pos-rel">
      <doc-side-toc :toc="tableOfContentsData" />
      <!-- 通过 readonly ProseMirror 加载出文档 -->
      <div class="page-document-view__content m-lr-auto">
        <a-skeleton class="m-t-40" active v-if="loadingViewData" :paragraph="{ rows: 20 }" />
        <div v-show="!loadingViewData" ref="docViewRef"></div>
      </div>
    </div>

    <div v-if="!loadingViewData" class="page-document-view__meta-section m-t-32 m-b-64">
      <!-- 点赞 -->
      <div
        class="page-document-view__thumbs-up-btn flex-row jyct-center anis-center m-lr-auto"
        :class="{
          active: thumbsUped
        }"
        @click="onThumbsUpDocument"
      >
        <thumbs-up theme="filled" :size="24" class="iconpark" />
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
          :placeholder="
            replyTo
              ? `回复 ${replyTo.creator.userName}：`
              : userTokenPayload
                ? '评论文章，按回车键提交...'
                : '请登录后评论...'
          "
          @press-enter="onSubmitComment"
          :disabled="!userTokenPayload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, provide, readonly, ref } from "vue";
import { templateRef } from "@vueuse/core";
import { useRoute } from 'vue-router';
import { ThumbsUp, FileLock } from '@icon-park/vue-next';
import { fetchDocFromPersistence, fusions, mocker } from '@/fusions';
import { useEditor } from "@/components/BibEditor/composable/useEditor";
import { useTableOfContents, bindClickScrollHandler } from '@/components/BibEditor/composable/useTableOfContents';
import { usePayloadFromToken, isBibUserTokenValid } from "@/utils";
import { savedDocViewData } from "./editing-doc-storage-ref";
import { message } from "ant-design-vue";
import DocViewHeader from '@/components/page-doc-view/doc-view-header.vue';
import DocComment from '@/components/page-doc-view/doc-comment.vue';
import DocSideToc from '@/components/DocSideToc/doc-side-toc.vue';
import us from 'underscore';
import type { DocumentCommentDto, DocumentViewData, UserSimpleDto } from "@/models";
import type { DocTableOfContentsUnit } from "@/components/BibEditor/typings";

// @Utils:
const requestForViewData = () => fusions.get(`/docs/${docId}?userId=${credential?.userId || -1}`);

// @States:
const route = useRoute();
const docId = route.params.docId as string;
const credential = usePayloadFromToken()!;
const loadingViewData = ref(false);
const noReadingAuth = ref(false);
const docViewRef = templateRef('docViewRef');
const userTokenPayload = usePayloadFromToken();
const commentInputer = templateRef<HTMLInputElement>('commentInputer');
const tableOfContentsData = ref<DocTableOfContentsUnit[]>([]);
const docName = `bib-doc-id${docId}`;

// @States:
const logined = isBibUserTokenValid();
const viewData = ref<DocumentViewData>();
const comments = ref<DocumentCommentDto[]>([]);
const commentContent = ref('');
const thumbsUped = ref(false);
const thumbsUpedCount = ref(0);
const replyTo = ref<DocumentCommentDto>();
const editable = ref(false);
const sendedJoinRequest = ref(false);

// # doc-side-toc
const headingRefs = ref<HTMLHeadingElement[]>([]);
const tocItemRefs = ref<HTMLElement[]>([]);

provide('doc-view-heading-refs', readonly(headingRefs));
provide('doc-view-toc-items-refs', tocItemRefs);

// @LifeCycles:
loadingViewData.value = true;
const fetchViewData = (): Promise<any> => {
  return us.isEmpty(savedDocViewData.value[docId])
    ? requestForViewData()
    : Promise.resolve({ // mock a structure as AxiosResponse
      data: {
        responseOk: true,
        data: savedDocViewData.value[docId]
      }
    });
}

// @Methods:
const onReplyTo = (replyToPayload: DocumentCommentDto) => {
  replyTo.value = replyToPayload;
  commentInputer.value.focus();
}
const onThumbsUpDocument = us.debounce(() => {
  fusions.put('/docs/thumbsUp', {
    userId: credential.userId,
    docId
  }).then((resp) => {
    if (resp.data.responseOk) {
      thumbsUped.value = !thumbsUped.value;
      if (thumbsUped.value) {
        thumbsUpedCount.value += 1;
      } else {
        thumbsUpedCount.value -= 1;
      }
    }
  })
}, 2000, true);
const onSubmitComment = () => {
  fusions.post('/docs/comment', {
    content: commentContent.value,
    docId,
    creatorId: credential.userId,
    replyToId: replyTo.value?.id || null
  }).then((resp) => {
    if (resp.data.responseOk) {
      comments.value.push(resp.data.data as DocumentCommentDto);

      commentContent.value = "";
      commentInputer.value.blur();
    }
  })

}
const createJoinCollaborationRequest = () => {
  fusions.post(`/docs/joinCollaborationRequest?docId=${docId}&userId=${credential!.userId}`)
    .then((resp) => {
      if (resp.data.responseOk) {
        message.success("申请访问权限成功，请耐心等待所有者回复后刷新！");
        sendedJoinRequest.value = true;
      }
    });
}
const updateJoinRequests = () => {
  requestForViewData().then((resp) => {
    if (resp.data.responseOk) {
      viewData.value = resp.data.data;
      savedDocViewData.value[docId] = resp.data.data;
    }
  });
}

// start-up:
Promise.all([
  fetchDocFromPersistence(docName),
  fetchViewData()
]).then(resolves => {
  const [ydocToPmDocJsonStringResp, viewDataResp] = resolves;
  if (ydocToPmDocJsonStringResp.data.responseOk && viewDataResp.data.responseOk) {
    viewData.value = viewDataResp.data.data;
    let canSeeDoc = !!credential
      ? viewData.value!.collaborators.map(u => u.uid).includes(credential!.userId)
      : viewData.value!.publicSharing;
    sendedJoinRequest.value = viewData!.value!.pendingRequests
      .map(u => u.uid).includes(
        credential.userId
      );
    if (!canSeeDoc) {
      !credential && message.warn('该文档暂时不提供公开阅览！');
      noReadingAuth.value = true;
      return;
    }

    // 以下内容为 “文章可见时” 的配置：
    editable.value = !!credential
      ? viewData.value!.collaborators.map(u => u.uid).includes(credential.userId)
      : false;

    const ydocToPmDocJsonString = ydocToPmDocJsonStringResp.data.data;

    // 存储一部分组件在本地使用渲染用的、有离线需求的数据
    comments.value = viewData.value!.comments;
    thumbsUped.value = viewData.value!.thumbsUped;
    thumbsUpedCount.value = viewData.value!.thumbUpUsers.length;

    const editorComposition = useEditor({
      contentForViewRender: ydocToPmDocJsonString,
      docName: `bib-doc-id${viewData.value!.id}`,
      readonly: true,
      credential
    });
    const { view } = editorComposition.initEditor(docViewRef.value); // fetch response must after vue component mounted
    tableOfContentsData.value = useTableOfContents(
      JSON.stringify(view.state.doc.toJSON())
    )

    // 将文章标题替换到 Tab
    document.title = `${viewData.value!.title} ｜查看文档 · Bib`

    loadingViewData.value = false;

    // -------- 加载完成后:
    // nextTick 读取文章所有 headings
    // why?: 因为此时上一个更新队列中的 reactiveEffect 都已执行完，可以读取稳定的文章视图
    nextTick(() => {
      headingRefs.value = Array.from(
        docViewRef.value!.querySelectorAll(
          '.ProseMirror h1,h2,h3,h4,h5,h6'
        ) as NodeListOf<HTMLHeadingElement>
      );
      bindClickScrollHandler(headingRefs, tocItemRefs);
    });
  }
});
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "@/less/shared.less";
.page-document-view__content {
  width: 64vw;

  @media screen and (max-width: 1024px) {
    & {
      width: 90vw;
    }
  }
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

.page-document-view__no-public-sharing-read {
  height: 100vh;
  background-color: @N100;
}
.page-document-view__no-public-sharing-header {
  .header-container;
}
.page-document-view__no-read-auth-img {
  width: 300px;
  height: auto;
}
</style>
