<template>
  <div class="page-document-view__wrapper flex-col">
    <doc-view-header :doc-data="docData" />

    <!-- 通过 readonly ProseMirror 加载出文档 -->
    <div class="page-document-view__content">
      <a-skeleton active v-if="loadingDocData" :paragraph="{ rows: 20 }" />
      <div v-show="!loadingDocData" ref="docViewRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { templateRef } from "@vueuse/core";
import { mocker } from '../../fusions';
import { useRoute } from 'vue-router';
import { useEditor } from "../../components/BibEditor/composable/useEditor";
import { usePayloadFromToken } from "../../utils/user-token-validation";
import DocViewHeader from '../../components/page-doc-view/doc-view-header.vue';
import type { DocumentViewData } from "../../models";

// @States:
const route = useRoute();
const docId = route.params.docId as string;
const credential = usePayloadFromToken()!;
const loadingDocData = ref(false);
const docViewRef = templateRef('docViewRef');

let docData = ref<DocumentViewData>();

// @LifeCycles:
(async () => {
  loadingDocData.value = true;
  const resp = await mocker.get(`/document/${docId}`);
  if (resp.data.responseOk) {
    docData.value = resp.data.data;

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

</script>

<style lang="less" scoped>
@import "../../less/color.less";

.page-document-view__content {
  width: 60vw;
  margin: 90px auto 0 auto;
}
</style>
