<template>
  <bib-editor-menu :editor-compose="editorCompose" fixed />

  <bib-editor
    ref="bibEditorRef"
    class="page-doc-edit__bib-editor"
    :init-editor-ref="initEditor"
    :editor-compose="editorCompose"
  />
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store';
import { templateRef } from "@vueuse/core";
import { usePayloadFromToken } from "@/utils";
import { useEditor } from "@/components/BibEditor/composable/useEditor";
import BibEditor from '@/components/BibEditor/bib-editor.vue';
import BibEditorMenu from '@/components/BibEditor/menu/bib-editor-menu.vue';

// @States:
const globalStore = useGlobalStore();
const bibEditorRef = templateRef('bibEditorRef');
const credential = usePayloadFromToken()!;
const { editorCompose, initEditor, onlineOtherUsers } = useEditor({
  initContent: '',
  docName: globalStore.editDocumentParam?.title || `${new Date().getTime()}`,
  credential,
});


</script>

<style lang="less" scoped>
.page-doc-edit__bib-editor {
  width: 874px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px #73737314;

  // for view-port vertical length extending:
  margin: 140px auto 60px auto;
}
</style>
