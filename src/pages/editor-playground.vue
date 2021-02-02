<template>
  <div class="flex-row anis-center p-10">
    <a-button @click="logDocJSON">输出文档</a-button>
  </div>
  <bib-editor
    ref="bibEditorRef"
    class="demo"
    :init-editor-ref="initEditor"
    :editor-compose="editorCompose"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useEditor } from "../hooks/useEditor";
import BibEditor from "../components/BibEditor/bib-editor.vue";

export default defineComponent({
  components: {
    BibEditor
  },
  setup() {
    // @States:
    const bibEditorRef = ref<any>(null);
    const { editorCompose, initEditor } = useEditor({
      initContent: "",
    });
    const logDocJSON = () => {
      console.log(editorCompose.toJSON());
    }

    return {
      bibEditorRef,
      initEditor,
      editorCompose,
      logDocJSON
    }
  }
});
</script>

<style lang="less" scoped></style>
