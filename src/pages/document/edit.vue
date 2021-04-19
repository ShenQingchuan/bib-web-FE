<template>
  <doc-view-header :view-data="viewData" editing @quit-document-edit="onQuitDocumentEdit" />

  <bib-editor-menu v-if="editorViewMounted" :editor-instance="editorInstance" fixed top="65px" />

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
import { ref, shallowRef, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePayloadFromToken } from "@/utils";
import { fusions } from '@/fusions';
import { editingDocViewData, savedDocViewData } from './editing-doc-storage-ref';
import { useEditor } from "@/components/BibEditor/composable/useEditor";
import DocViewHeader from '@/components/page-doc-view/doc-view-header.vue';
import BibEditorMenu from '@/components/BibEditor/menu/bib-editor-menu.vue';
import * as us from 'underscore';
import type { EditorInstance } from '@/components/BibEditor/typings';
import type { DocumentViewData } from '@/models';

const route = useRoute(), router = useRouter();
const credential = usePayloadFromToken()!;

// @States:
const editorViewMounted = ref(false);
const viewData = ref<DocumentViewData>();

// 初始化 editor view
const { initEditor } = useEditor({
  docName: `bib-doc-id${route.params.docId}`,
  credential,
});
let editorInstance = shallowRef({} as EditorInstance);

// @Methods:
const initEditorViewRef = (el: any) => {
  editorInstance.value = initEditor(el)
  editorViewMounted.value = true;
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

        router.push(route.path.slice(0, -5));
      }
    });
  }
}

if (!us.isEmpty(editingDocViewData.value)) {
  viewData.value = editingDocViewData.value!;
  nextTick(() => {
    editingDocViewData.value = null;
  })
} else {
  (async () => {
    const resp = await fusions.get(`/docs/${route.params.docId}`);
    if (resp.data.responseOk) {
      viewData.value = resp.data.data;
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
</style>
