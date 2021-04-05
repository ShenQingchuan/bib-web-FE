<template>
  <bib-editor-menu :editor-compose="editorCompose" fixed />
  <div class="flex-row jyct-center anis-center p-lr-6 demo-utils">
    <a-button class="m-lr-10" @click="logDocJSON">输出 Doc JSON</a-button>
    <a-button class="m-lr-10" @click="logSelectionNodesBetween">输出 Selection Nodes Between</a-button>
    <a-button class="m-lr-10" @click="logTextContentAbstract">输出 文章摘要</a-button>
    <a-button class="m-lr-10" @click="logTableOfContents">输出 目录</a-button>
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
import getTableOfContents from '../components/BibEditor/composable/useTableOfContents';
import type { DocContentElement } from '../components/BibEditor/typings';

// @States:
const bibEditorRef = ref<any>(null);
const credential = usePayloadFromToken()!;
const { editorCompose, initEditor, onlineOtherUsers } = useEditor({
  initContent: '',
  docName: 'Playground',
  credential,
});
const logDocJSON = () => {
  console.log(JSON.stringify(editorCompose.view.value.state.doc.toJSON()));
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
const logTextContentAbstract = () => {
  const abstract = editorCompose.view.value.state.doc.textContent.slice(0, 150);
  console.log(abstract);
}
const logTableOfContents = () => {
  const toc = getTableOfContents(editorCompose.view.value.state.doc.toJSON() as DocContentElement);
  console.log(JSON.stringify(toc, null, 2));
}
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
  width: 100vw;
  position: fixed;
  top: 70px;
  z-index: 99;
}
</style>
