<template>
  <bib-editor-menu :editor-compose="editorCompose" fixed />
  <div class="flex-row anis-center p-lr-6 demo-utils">
    <a-button class="m-lr-10" @click="logDocJSON">输出 Doc JSON</a-button>
    <a-button class="m-lr-10" @click="logSelectionNodesBetween">输出 Selection Nodes Between</a-button>
  </div>
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
import { usePayloadFromToken } from '../utils';
import BibEditor from '../components/BibEditor/bib-editor.vue';
import BibEditorMenu from '../components/BibEditor/menu/bib-editor-menu.vue';

// @States:
const bibEditorRef = ref<any>(null);
const credential = usePayloadFromToken()!;
const { editorCompose, initEditor, onlineOtherUsers } = useEditor({
  initContent: '',
  docName: 'Playground',
  credential,
});
const logDocJSON = () => {
  console.log(JSON.stringify(editorCompose.view.value.state.doc.toJSON()).length);
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

<style lang="less" scoped>
.demo {
  width: 874px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px #73737314;

  // for view-port vertical length extending:
  margin: 140px auto 60px auto;
}
.demo-utils {
  position: fixed;
  top: 70px;
  z-index: 99;
}
</style>
