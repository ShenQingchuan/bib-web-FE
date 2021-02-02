<template>
  <div class="bib-editor" :ref="initEditorRef"></div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { EditorView } from "prosemirror-view";

defineProps<{
  view: EditorView,
  initEditorRef: (el: any) => void
}>();
</script>

<style lang="less">
.bib-editor {
  &.demo {
    margin: 40px auto;
  }
  width: 80vw;
  min-height: 100vh;

  .ProseMirror {
    width: 100%;
    height: 100%;
    line-height: 1.74;
    font-size: 15px;
    letter-spacing: 0.008em;

    &:focus {
      outline: none;
    }

    * {
      margin: 0;
      padding: 0;
    }

    code {
      padding: 0.2em 0.4em;
      font-size: 85%;
      background-color: var(--color-markdown-code-bg);
      border-radius: 6px;
      font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
        monospace;
      background-color: rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.07);
      line-height: inherit;
      word-wrap: break-word;
      text-indent: 0;
    }
    blockquote {
      margin-top: 5px;
      margin-bottom: 5px;
      padding-left: 1em;
      margin-left: 0px;
      border-left: 3px solid #eee;
      &,
      & * {
        color: #8c8c8c;
      }
    }

    ul {
      list-style-type: disc;
    }
    li {
      margin-left: 23px;
    }
  }
  .CodeMirror {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
      monospace;
    height: auto;
    border: 1px solid #eee;
  }
  .CodeMirror-scroll {
    overflow: unset !important;
  }
}
</style>
