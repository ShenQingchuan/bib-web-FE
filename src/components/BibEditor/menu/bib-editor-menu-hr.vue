<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button class="bib-editor-menu-item__hr-btn p-lr-4" type="link" @click="addHrLine">
      <MinusOutlined />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { MinusOutlined } from "@ant-design/icons-vue";
import { exitCode } from 'prosemirror-commands';
import { chainCommands } from 'prosemirror-commands';
import type { EditorComposable } from "../typings";
import { EditorSchema } from '../editor-schema';

// @States:
const editorCompose = inject<EditorComposable>("editorCompose");

// @Methods:
const addHrLine = () => {
  editorCompose?.addHorizontalRuleLine();
}
</script>

<style lang='less'>
@import "../../../less/color.less";

.bib-editor-menu-item {
  &__hr-btn {
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