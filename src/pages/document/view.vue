<template>
  <div class="page-document-view__wrapper flex-col">
    <doc-view-header :view-data="viewData" />

    <doc-side-toc :toc="tableOfContentsData" />

    <!-- 通过 readonly ProseMirror 加载出文档 -->
    <div class="page-document-view__content m-t-80 m-lr-auto">
      <a-skeleton class="m-t-40" active v-if="loadingViewData" :paragraph="{ rows: 20 }" />
      <div v-show="!loadingViewData" ref="docViewRef"></div>
    </div>

    <div v-if="!loadingViewData" class="page-document-view__meta-section m-t-32 m-b-64">
      <!-- 点赞 -->
      <div
        class="page-document-view__thumbs-up-btn flex-row jyct-center anis-center m-lr-auto"
        :class="{
          'active': thumbsUped
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
import { nextTick, provide, readonly, ref } from "vue";
import { templateRef } from "@vueuse/core";
import { useRoute } from 'vue-router';
import { ThumbsUp } from '@icon-park/vue-next';
import { fetchDocFromPersistence, fusions, mocker } from '@/fusions';
import { useEditor } from "@/components/BibEditor/composable/useEditor";
import { useTableOfContents } from '@/components/BibEditor/composable/useTableOfContents';
import { usePayloadFromToken, userDetailsStorageRef } from "@/utils";
import { savedDocViewData } from "./editing-doc-storage-ref";
import DocViewHeader from '@/components/page-doc-view/doc-view-header.vue';
import DocComment from '@/components/page-doc-view/doc-comment.vue';
import DocSideToc from '@/components/DocSideToc/doc-side-toc.vue';
import * as us from 'underscore';
import type { DocumentCommentDTO, DocumentViewData, UserSimpleDTO } from "@/models";
import type { DocTableOfContentsUnit } from "@/components/BibEditor/typings";

// @States:
const route = useRoute();
const docId = route.params.docId as string;
const credential = usePayloadFromToken()!;
const loadingViewData = ref(false);
const docViewRef = templateRef('docViewRef');
const userTokenPayload = usePayloadFromToken();
const commentInputer = templateRef<HTMLInputElement>('commentInputer');
const tableOfContentsData = ref<DocTableOfContentsUnit[]>([]);
const docName = `bib-doc-id${docId}`;

// @States:
const viewData = ref<DocumentViewData>();
const comments = ref<DocumentCommentDTO[]>([]);
const commentContent = ref('');
const thumbsUped = ref(false);
const thumbsUpedCount = ref(0);
const replyTo = ref<DocumentCommentDTO>();

// # doc-side-toc
const headingRefs = ref<HTMLHeadingElement[]>([]);
const tocItemRefs = ref<HTMLElement[]>([]);

provide('doc-view-heading-refs', readonly(headingRefs));
provide('doc-view-toc-items-refs', tocItemRefs);

// @LifeCycles:
loadingViewData.value = true;
const fetchViewData = (): any =>
  us.isEmpty(savedDocViewData.value[docId])
    ? fusions.get(`/docs/${docId}?userId=${credential.userId}`)
    : Promise.resolve({ // mock a structure as AxiosResponse
      data: {
        responseOk: true,
        data: savedDocViewData.value[docId]
      }
    });

Promise.all([
  fetchDocFromPersistence(docName),
  fetchViewData()
]).then(resolves => {
  const [ydocToPmDocJsonStringResp, viewDataResp] = resolves;
  if (ydocToPmDocJsonStringResp.data.responseOk && viewDataResp.data.responseOk) {
    viewData.value = viewDataResp.data.data;
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
      console.log('[ headingRefs.value ]', headingRefs.value);
      headingRefs.value.forEach(h => console.log(
        `header: ${h.textContent} , offsetTop: ${h.offsetTop}, scrollTop: ${h.scrollTop}, clientHeight: ${h.clientHeight}`)
      );
      tocItemRefs.value = Array.from(
        document.querySelectorAll('.doc-side-toc__item')
      );
      tocItemRefs.value.forEach((tocItem, i) => {
        tocItem.onclick = (e) => {
          const target = headingRefs.value[i];
          window.scrollTo({
            top: target.offsetTop - target.clientHeight,
            behavior: 'smooth'
          })
          e.stopPropagation();
        }
      })
    })
  }
});

// @Methods:
const onReplyTo = (replyToPayload: DocumentCommentDTO) => {
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
      comments.value.push(resp.data.data as DocumentCommentDTO);

      commentContent.value = "";
      commentInputer.value.blur();
    }
  })

}
</script>

<style lang="less" scoped>
@import "../../less/color.less";
@import "../../less/shared.less";
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
</style>
