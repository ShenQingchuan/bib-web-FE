<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button
      class="bib-editor-menu-item__link-btn p-lr-4"
      type="link"
      :class="{
        active: isActive
      }"
      @click="toggleLinkMark"
    >
      <LinkOutlined></LinkOutlined>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { LinkOutlined } from "@ant-design/icons-vue";
import { EditorSchema } from '../editor-schema';
import { showUpdateLinkModal, updateLinkWithPos } from '@editor/plugins';
import { Modal } from 'ant-design-vue';
import type { EditorInstance } from "../typings";
import { shieldYjsTrascationEvent } from '../utils';

// @States:
const isActive = ref(false);
const editorInstance = inject<EditorInstance>("editorInstance")!;

// @LifeCycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (shieldYjsTrascationEvent(tr)) return;
    editorInstance.applyForNodesAtCursor((node) => {
      if (node.type === EditorSchema.nodes.text) {
        let markTypes = node.marks.map(m => m.type)
        if (tr.storedMarks) {
          markTypes = markTypes.concat(tr.storedMarks.map(m => m.type));
        }
        isActive.value = markTypes.includes(EditorSchema.marks.link);
      } else {
        isActive.value = false;
      }
    })
  })
})

// @Methods:
const toggleLinkMark = () => {
  const view = editorInstance.view;
  const { doc, selection: { from, to }, tr } = view.state;

  if (isActive.value) {
    const currentTextNode = doc.nodeAt(from)!;
    Modal.confirm({
      title: '确定要取消链接么？',
      icon: createVNode(ExclamationCircleOutlined),
      content: '这段文字将被恢复成普通文本格式。',
      onOk: () => {
        updateLinkWithPos(view, currentTextNode.textContent, [], false, from);
      }
    })
    return;
  }

  const currentTextNode = view.state.doc.cut(from, to);
  showUpdateLinkModal(view, from, currentTextNode);
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__link-btn {
    .menu-btn-common;
  }
}
</style>
