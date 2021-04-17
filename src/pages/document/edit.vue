<template>
  <doc-view-header :view-data="viewData" editing />

  <bib-editor-menu v-if="editorViewMounted" :editor-instance="editorInstance" fixed top="65px" />

  <div class="page-doc-edit__bib-editor-wrapper">
    <input
      class="page-doc-edit__title-inputer p-lr-60 p-t-36 fs-32 fw-700"
      v-model="docTitle"
      type="text"
      placeholder="请输入文章标题..."
    />
    <div class="page-doc-edit__bib-editor" :ref="initEditorViewRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { usePayloadFromToken } from "@/utils";
import { mocker } from '@/fusions';
import { editingDocViewData } from './editing-doc-storage-ref';
import { useEditor } from "@/components/BibEditor/composable/useEditor";
import DocViewHeader from '@/components/page-doc-view/doc-view-header.vue';
import BibEditorMenu from '@/components/BibEditor/menu/bib-editor-menu.vue';
import type { EditorInstance } from '@/components/BibEditor/typings';
import type { DocumentViewData } from '@/models';

const route = useRoute();
const credential = usePayloadFromToken()!;

// @States:
const docTitle = ref('');
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

if (editingDocViewData.value?.id) {
  viewData.value = editingDocViewData.value;
  nextTick(() => {
    editingDocViewData.value = null;
  })
} else {
  (async () => {
    const resp = await mocker.get(`/document/${route.params.docId}`);
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
}
</style>
