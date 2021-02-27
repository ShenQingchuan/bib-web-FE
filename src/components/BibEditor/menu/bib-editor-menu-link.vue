<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button
      type="link"
      class="bib-editor-menu-item__link-btn p-lr-4"
      :class="{
        active: isActive
      }"
      @click="toggleLinkMark"
    >
      <LinkOutlined />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { LinkOutlined } from "@ant-design/icons-vue";
import type { EditorComposable } from "../typings";
import { EditorSchema } from '../editor-schema';
import { showUpdateLinkModal, updateLink } from '../plugins/handle-link-click';
import { Modal } from 'ant-design-vue';

// @States:
const isActive = ref(false);
const editorCompose = inject<EditorComposable>("editorCompose");

// @LifeCycles:
onMounted(() => {
  editorCompose?.onEditorDispatched((tr) => {
    editorCompose.applyForNodesAtCursor((node) => {
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
  const view = editorCompose!.view.value;
  const { doc, tr, selection: { from, to, empty: selectionEmpty } } = view.state;

  if (isActive.value) {
    const currentTextNode = doc.nodeAt(from)!;
    Modal.confirm({
      title: '确定要取消链接么？',
      icon: createVNode(ExclamationCircleOutlined),
      content: '这段文字将被恢复成普通文本格式。',
      onOk: () => {
        updateLink(view, from, currentTextNode.textContent, []);
      }
    })
    return;
  }

  if (selectionEmpty) {
    const currentTextNode = doc.nodeAt(from)!;
    showUpdateLinkModal(view, from, currentTextNode);
  }
}
</script>

<style lang="less" scoped>
@import '../../../less/color.less';
.bib-editor-menu-item {
  &__link-btn {
    &,
    &:hover {
      border: none;
      color: @N600;
    }

    &:hover,
    &.active {
      background-color: @N200;
      border-radius: 6px;
    }
  }
}
</style>
