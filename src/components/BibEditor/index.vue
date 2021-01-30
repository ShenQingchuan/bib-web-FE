<template>
  <div class="bib-editor" :ref="initEditorRef"></div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { EditorSchema } from "./editor-schema";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser } from "prosemirror-model";
import { buildKeymap } from "prosemirror-example-setup";
import { buildInputRules, buildPasteRules } from "./input-rules";
import { onUnmounted } from "vue";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { history } from "prosemirror-history";
import CodeBlockView, { arrowHandlersInCodeBlock } from "./code-block-view";
import placeholder from "./placeholder";
import type { BibEditorOptions } from "./typings";

const props = defineProps<{
  options: BibEditorOptions;
}>();
const initContent = document.createElement("div");
initContent.innerHTML = props.options.initContent;

let editorView: EditorView;
const initEditorRef = (el: any) => {
  editorView = new EditorView(el as HTMLDivElement, {
    state: EditorState.create({
      doc: DOMParser.fromSchema(EditorSchema).parse(initContent),
      plugins: [
        history(),
        keymap(buildKeymap(EditorSchema)),
        buildInputRules(EditorSchema),
        ...buildPasteRules(EditorSchema),
        keymap(baseKeymap),
        dropCursor(),
        gapCursor(),
        arrowHandlersInCodeBlock,
        placeholder("写点什么吧 ...")
      ],
    }),
    nodeViews: {
      code_block(node, view, getPos) {
        return new CodeBlockView(node, view, getPos);
      },
    },
  });
};

onUnmounted(() => {
  editorView.destroy();
});
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
