<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button
      class="bib-editor-menu-item__quote-btn p-lr-4"
      type="link"
      :class="{
        active: isActive
      }"
      @click="toggleQuoteNode"
    >
      <Icon :component="QuoteNodeIcon" />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import { EditorSchema } from '@editor/schemas';
import Icon from "@ant-design/icons-vue";
import QuoteNodeIcon from '@editor/icons/quote-node-icon.vue';
import type { EditorInstance } from "@editor/typings";
import { findParentNode } from 'prosemirror-utils';
import { shieldYjsTrascationEvent } from '@editor/utils';

// @States:
const isActive = ref(false);
const editorInstance = inject<EditorInstance>("editorInstance")!;

// @Lifecycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (shieldYjsTrascationEvent(tr)) return;
    const { selection } = editorInstance.view.state;
    isActive.value = !!findParentNode(
      node => node.type === EditorSchema.nodes.blockquote
    )(selection);
  })
})

// @Methods:
const toggleQuoteNode = () => {
  editorInstance?.toggleQuoteBlock();
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item {
  &__quote-btn {
    .menu-btn-common;
  }
}
</style>