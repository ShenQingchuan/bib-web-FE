<template>
  <div :ref="onTocWrapperMounted" class="doc-side-toc__wrapper to-ellipsis p-l-8">
    <doc-side-toc-item v-for="(unit, i) in toc" :key="i" :item="unit" :index="`${i}`" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, onUnmounted, provide, inject } from "vue";
import DocSideTocItem from './doc-side-toc-item.vue';
import type { Ref } from 'vue';
import type { DocTableOfContentsUnit } from '@/components/BibEditor/typings';

const props = defineProps<{
  toc: DocTableOfContentsUnit[]
}>();

// @States:
const activeItemIndex = ref(props.toc.length > 0 ? '0' : ''); // 默认首个
const headingRefs = inject<Ref<HTMLHeadingElement[]>>('doc-view-heading-refs')!;
let tocItemRefs: HTMLElement[] = [];

provide('doc-side-toc__active-index', activeItemIndex);
provide('update:doc-side-toc__active-index', (indexKey: string) => {
  activeItemIndex.value = indexKey;
});


// @Methods:
const onDocumentScroll = () => {
  // 获取当前文档流的 scrollTop
  const scrollTop = (document.documentElement.scrollTop || document.body.scrollTop);
  // 找该点亮的 heading
  for (let n = 0; n < headingRefs.value.length; n++) {
    // 如果 scrollTop 大于或等于索引 n 元素的 offsetTop
    // 则说明 n-1 的内容已经完全不可见
    // 那么此时导航索引就应该是 n 了
    if (scrollTop >= headingRefs.value[n].offsetTop) {
      activeItemIndex.value = tocItemRefs[n].dataset.tocIndex!;
    }
  }
};
const onTocWrapperMounted = () => {
  tocItemRefs = Array.from(
    document.querySelectorAll('.doc-side-toc__item')
  );
}

// @LifeCycles:
onMounted(() => {
  window.addEventListener('scroll', onDocumentScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', onDocumentScroll);
});
</script>

<style lang="less" scoped>
@import "../../less/color.less";
.doc-side-toc__wrapper {
  position: fixed;
  z-index: 9;
  top: 120px;
  left: 40px;
  border-left: 2px solid @N300;
  max-width: 180px;
}
</style>