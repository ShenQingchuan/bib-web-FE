<template>
  <bib-editor-menu :editor-compose="editorCompose" />
  <a-button class="m-lr-10" @click="logDocJSON">输出 Doc JSON</a-button>
  <a-button class="m-lr-10" @click="logSelectionNodesBetween"
    >输出 Selection Nodes Between</a-button
  >
  <bib-editor
    ref="bibEditorRef"
    class="demo"
    :init-editor-ref="initEditor"
    :editor-compose="editorCompose"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useEditor } from '../components/BibEditor/composable/useEditor';
import BibEditor from '../components/BibEditor/bib-editor.vue';
import BibEditorMenu from '../components/BibEditor/menu/bib-editor-menu.vue';

// @States:
const bibEditorRef = ref<any>(null);
const { editorCompose, initEditor } = useEditor({
  initContent: ''
});
const logDocJSON = () => {
  console.log(editorCompose.view.value.state.doc.toJSON());
};
const logSelectionNodesBetween = () => {
  const { selection } = editorCompose.view.value.state;
  const { from, to, empty } = selection;
  if (empty) return;
  console.log(
    editorCompose.view.value.state.doc.nodesBetween(from, to, (node) => {
      console.log('[ node ]', node);
    })
  );
};
</script>

<style lang="less" scoped></style>
