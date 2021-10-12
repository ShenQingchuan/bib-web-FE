<template>
  <doc-view-header
    editing
    :view-data="viewData"
    :online-users="onlineOtherUsers"
    @quit-document-edit="onQuitDocumentEdit"
  />

  <bib-editor-menu
    v-if="editorViewMounted"
    :editor-instance="editorInstance"
    fixed
    top="65px"
  />

  <doc-side-toc class="page-doc-edit__bib-doc-toc" :top="150" fixed />

  <div class="page-doc-edit__bib-editor-wrapper">
    <input
      v-if="viewData"
      class="page-doc-edit__title-inputer p-lr-60 p-t-36 fs-32 fw-700"
      v-model="viewData.title"
      type="text"
      placeholder="请输入文章标题..."
    />
    <div class="page-doc-edit__bib-editor" :ref="initEditorViewRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, nextTick, provide, readonly, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { bindClickScrollHandler } from "@editor/composable";
import { usePayloadFromToken } from "@/utils";
import { fusions } from '@/fusions';
import { editingDocViewData, savedDocViewData } from './editing-doc-storage-ref';
import { useEditor } from "@editor/composable/useEditor";
import { message } from 'ant-design-vue';
import { bibEditorHeadingSelector } from '@editor/constants';
import DocViewHeader from '@/components/page-doc-view/doc-view-header.vue';
import DocSideToc from '@/components/DocSideToc/doc-side-toc.vue';
import BibEditorMenu from '@editor/menu/bib-editor-menu.vue';
import us from 'underscore';
import type { DocTableOfContentsUnit, EditorInstance } from '@editor/typings';
import type { DocumentViewData } from '@/models';

const route = useRoute(), router = useRouter();
const credential = usePayloadFromToken()!;

// @States:
const editorViewMounted = ref(false);
const editableGuardPass = ref(false);
const viewData = ref<DocumentViewData>();

// # doc-side-toc
let tableOfContentsData = ref<DocTableOfContentsUnit[]>([]);
const headingRefs = ref<HTMLHeadingElement[]>([]);
const tocItemRefs = ref<HTMLElement[]>([]);
provide('doc-view-heading-refs', readonly(headingRefs));
provide('doc-view-toc-items-refs', tocItemRefs);
provide('doc-toc-data', tableOfContentsData);

// 初始化 editor view
const { initEditor, onlineOtherUsers } = useEditor({
  docName: `bib-doc-id${route.params.docId}`,
  credential,
});
let editorInstance = shallowRef({} as EditorInstance);

// @Methods:
const initEditorViewRef = (el: any) => {
  editorInstance.value = initEditor(el);
  if (process.env.NODE_ENV === 'development') {
    (window as any).bibEditor = editorInstance.value;
  }
  editorViewMounted.value = true;
  watch(editorInstance.value.tableOfContents, (newVal) => {
    tableOfContentsData.value = newVal;
    headingRefs.value = Array.from(
      el.querySelectorAll(
        bibEditorHeadingSelector
      ) as NodeListOf<HTMLHeadingElement>
    );
    nextTick(() => {
      bindClickScrollHandler(headingRefs, tocItemRefs);
    });
  });
}
const onQuitDocumentEdit = () => {
  if (viewData.value) {
    const { title, publicSharing, contentAbstract: viewDataAbstarct } = viewData.value;
    const docId = route.params.docId as string;
    const savingForm = {
      docId, title,
      contentAbstract: viewDataAbstarct.length === 0
        ? editorInstance.value.view.state.doc.textContent.slice(0, 150)
        : viewDataAbstarct,
      publicSharing
    };
    fusions.put('/docs/meta', savingForm).then(resp => {
      if (resp.data.responseOk) {
        savedDocViewData.value[docId] = resp.data.data as DocumentViewData;
        editingDocViewData.value = null;

        editorInstance.value.quitEditor(() => {
          nextTick(() => {
            // disconnect websocket 后需要更新在线列表，
            // 最好将路由跳转推到下一个 tick
            router.push(route.path.slice(0, -5));
          })
        });
      }
    });
  }
}
const editableGuard = () => {
  if (!viewData.value!.collaborators.map(u => u.uid).includes(credential.userId)) {
    message.warn("您还没有此篇文档的编辑权限！");
    router.push(route.path.slice(0, -5));
    return;
  }

  editableGuardPass.value = true;
}


if (!us.isEmpty(editingDocViewData.value)) {
  viewData.value = editingDocViewData.value!;
  nextTick(() => {
    editableGuard();
    editingDocViewData.value = null;
  })
} else {
  (async () => {
    const resp = await fusions.get(`/docs/${route.params.docId}?userId=${credential.userId}`);
    if (resp.data.responseOk) {
      viewData.value = resp.data.data;
      nextTick(() => {
        editableGuard();
      })
    }
  })();
}
</script>

<style lang="less" scoped>
.page-doc-edit__bib-editor-wrapper {
  width: 874px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px #73737314;

  // for view-port vertical length extending:
  margin: 180px auto 60px auto;
}
.page-doc-edit__title-inputer {
  outline: none;
  border: none;
  width: 100%;
}

@media screen and (max-width: 1300px) {
  .page-doc-edit__bib-doc-toc {
    display: none;
  }
}
</style>
