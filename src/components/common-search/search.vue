<template>
  <a-auto-complete class="component-common-search">
    <a-input placeholder="搜索" @input="onInput">
      <template #prefix>
        <search-outlined></search-outlined>
      </template>
    </a-input>
  </a-auto-complete>
</template>

<script setup lang="ts">
import {
  SearchOutlined,
} from "@ant-design/icons-vue";
import { defineProps } from "vue";

defineProps<{
  onInput?: (e: InputEvent) => void;
}>();

// @States:

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
</style>


<style lang="less">
.component-common-search .ant-input-affix-wrapper {
  max-width: 200px;
  border-radius: 6px;
  border: none;
  margin-right: 24px;
  box-shadow: none !important;
  &,
  & input {
    background-color: #f5f5f5;
  }
}
</style>
