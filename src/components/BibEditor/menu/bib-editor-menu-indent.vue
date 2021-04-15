<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-r-2">
    <a-button class="bib-editor-menu-item__indent-btn p-r-4" type="link" @click="updateIndent('+')">
      <template #icon>
        <MenuUnfoldOutlined />
      </template>
    </a-button>
    <a-button class="bib-editor-menu-item__indent-btn p-r-4" type="link" @click="updateIndent('-')">
      <template #icon>
        <MenuFoldOutlined />
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import type { EditorInstance } from '../typings';

// @States:
const editorInstance = inject<EditorInstance>("editorInstance");

// @LifeCycels:

// @Methods:
const updateIndent = (t: '+' | '-') => {
  editorInstance?.updateIndent(t);
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item__indent-btn {
  .menu-btn-common;
}
</style>
