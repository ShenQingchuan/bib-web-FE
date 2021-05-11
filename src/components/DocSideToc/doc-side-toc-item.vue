<template>
  <div
    class="doc-side-toc__item"
    :style="{
      paddingLeft: `${(item.level - 1) * 6}px`
    }"
    :data-toc-index="index"
  >
    <div
      class="doc-side-toc__item-title p-tb-6 m-b-2 fs-12 p-lr-6 to-ellipsis"
      :class="{
        'active': activeIndexKey === index
      }"
      @click.self="updateIndexKey(index)"
    >{{ item.title }}</div>
    <doc-side-toc-item
      v-for="(child, i) in item.children"
      :key="i"
      :item="child"
      :index="`${index}-${i}`"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, inject } from "vue";
import type { Ref } from 'vue';
import type { DocTableOfContentsUnit } from '@/components/BibEditor/typings';

defineProps<{
  item: DocTableOfContentsUnit;
  index: string;
}>();

// @States:
const activeIndexKey = inject<Ref<string>>('doc-side-toc__active-index')!;
const updateIndexKey = inject<(indexKey: string) => void>('update:doc-side-toc__active-index')!;

// @Methods:
</script>

<style lang="less" scoped>
@import "../../less/color.less";

.doc-side-toc__item {
  cursor: pointer;

  &-title.active {
    border-left: 2px solid @primary-color;
    color: @primary-color;
    background-color: @N100;
  }
  &-title:hover {
    color: @primary-color;
    background-color: @N100;
  }
}
</style>
