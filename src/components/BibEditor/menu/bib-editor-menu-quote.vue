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
import { EditorSchema } from '../editor-schema';
import Icon from "@ant-design/icons-vue";
import QuoteNodeIcon from '../icons/quote-node-icon.vue';
import type { EditorComposable } from "../typings";
import { findParentNode } from 'prosemirror-utils';

// @States:
const isActive = ref(false);
const editorCompose = inject<EditorComposable>("editorCompose");

// @Lifecycles:
onMounted(() => {
  editorCompose?.onEditorDispatched(() => {
    const { selection } = editorCompose.view.value.state;
    isActive.value = !!findParentNode(
      node => node.type === EditorSchema.nodes.blockquote
    )(selection);
  })
})

// @Methods:
const toggleQuoteNode = () => {
  editorCompose?.toggleQuoteBlock();
}
</script>

<style lang="less" scoped>
@import "../../../less/color.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item {
  &__quote-btn {
    .menu-btn-common;
  }
}
</style>