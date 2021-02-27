<template>
  <div
    class="bib-editor"
    :ref="initEditorRef"
    @click="editorCompose.focus()"
  ></div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import type { EditorComposable } from "./typings";

defineProps<{
  editorCompose: EditorComposable;
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
    color: #000;

    &:focus {
      outline: none;
    }

    * {
      margin: 0;
      padding: 0;
    }

    .ProseMirror-selectednode {
      outline: none;
    }

    code {
      margin: 0 0.4em;
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

      &[data-type='task-list'] {
        list-style: none;

        li[data-type='task-item'] {
          margin-left: 24px;
          position: relative;
          padding-left: 14px;

          input[type='checkbox'] {
            width: 18px;
            height: 18px;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }

          p.task-content {
            margin-left: 14px;
          }
        }
      }

      // 嵌套 bullet list 的点形状
      ul {
        list-style: circle;
        ul {
          list-style: square;
        }
      }
    }
    li {
      margin-left: 24px;
      list-style-position: inside;

      p {
        display: inline;
        margin-left: 5px;
      }
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
