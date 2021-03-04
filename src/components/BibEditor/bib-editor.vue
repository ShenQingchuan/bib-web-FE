<template>
  <div class="bib-editor" :ref="initEditorRef"></div>
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
@import "../../less/color.less";

.bib-editor {
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
      box-sizing: border-box;
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

      li {
        margin-left: 24px;
      }
      &[data-type="task-list"] {
        list-style: none;

        li[data-type="task-item"] {
          margin-left: 18px;
          input[type="checkbox"] {
            width: 14px;
            height: 14px;
            display: inline-block;
          }

          div.task-content {
            margin-left: 8px;
            display: inline-block;
            p {
              margin-left: 0;
            }
          }
        }
      }

      // 嵌套 bullet list 的点形状
      ul {
        list-style-type: circle;
        ul {
          list-style-type: square;
        }
      }
    }
    li {
      list-style-position: inside;

      p {
        display: inline;
        margin-left: 0;
      }
    }

    ol li {
      margin-left: 20px;
      p {
        margin-left: 4px;
      }
    }

    hr {
      margin: 1.2rem 0;
      background-color: #e8e8e8;
      border: 1px solid transparent;
      cursor: text;
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
