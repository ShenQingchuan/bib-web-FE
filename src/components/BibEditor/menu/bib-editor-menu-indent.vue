<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-button class="bib-editor-menu-item__indent-btn p-lr-4" type="link">
      <MenuFoldOutlined />
    </a-button>
    <a-button class="bib-editor-menu-item__indent-btn p-lr-4" type="link">
      <MenuUnfoldOutlined />
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';

// @States:

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
@import "../../../less/color.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item__indent-btn {
  .menu-btn-common;
}
</style>
