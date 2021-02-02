<template>
  <bib-editor-menu :editor-compose="editorCompose" />
  <bib-editor
    ref="bibEditorRef"
    class="demo"
    :init-editor-ref="initEditor"
    :editor-compose="editorCompose"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useEditor } from "../components/BibEditor/hooks/useEditor";
import BibEditor from "../components/BibEditor/bib-editor.vue";
import BibEditorMenu from "../components/BibEditor/bib-editor-menu.vue";

// @States:
const bibEditorRef = ref<any>(null);
const { editorCompose, initEditor } = useEditor({
  initContent: "",
});
const logDocJSON = () => {
  console.log(editorCompose.view.value.state.doc.toJSON());
}

</script>

<style lang="less" scoped></style>
