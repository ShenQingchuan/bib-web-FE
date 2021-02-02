<template>
  <div class="flex-row anis-center p-10">
    <a-button @click="logDocJSON">输出文档</a-button>
  </div>
  <bib-editor ref="bibEditorRef" class="demo" :view="editorView" :init-editor-ref="initEditorRef" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import type { BibEditorOptions } from "../components/BibEditor/typings";
import BibEditor from "../components/BibEditor/bib-editor.vue";
import { useEditor } from "../hooks/useEditor";

export default defineComponent({
  components: {
    BibEditor
  },
  setup() {
    // @States:
    const bibEditorRef = ref<any>(null);
    const options: BibEditorOptions = {
      initContent: "",
    };
    const { editorView, initEditorRef, docToJSON } = useEditor(options);
    const logDocJSON = () => {
      console.log(docToJSON());
    }

    return {
      bibEditorRef,
      editorView,
      initEditorRef,
      logDocJSON
    }
  }
});
</script>

<style lang="less" scoped></style>
