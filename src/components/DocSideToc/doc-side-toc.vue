<template>
  <div
    class="doc-side-toc__wrapper to-ellipsis p-l-8"
    :style="{
      top: `${top}px`,
      left: `${left}px`,
    }"
  >
    <h3>目录</h3>
    <doc-side-toc-item
      v-for="(unit, i) in toc"
      :key="i"
      :item="unit"
      :index="`${i}`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide, inject, withDefaults } from "vue";
import DocSideTocItem from './doc-side-toc-item.vue';
import type { Ref } from 'vue';
import type { DocTableOfContentsUnit } from '@/components/BibEditor/typings';

const props = withDefaults(defineProps<{
  toc: DocTableOfContentsUnit[],
  top?: number,
  left?: number
}>(), {
  top: 100,
  left: 40
});

// @States:
const needScrolling = ref(false);
const activeItemIndex = ref(props.toc.length > 0 ? '0' : ''); // 默认首个
const headingRefs = inject<Ref<HTMLHeadingElement[]>>('doc-view-heading-refs')!;
const tocItemRefs = inject<Ref<HTMLHeadingElement[]>>('doc-view-toc-items-refs')!;

// 滚动所需的上下文
let rafTimer: number;
let scrollTimer: number;
let scrollCursor: number, scrollSnapshot: number;

provide('doc-side-toc__active-index', activeItemIndex);
provide('doc-side-toc__need-scrolling', needScrolling);
provide('update:doc-side-toc__active-index', (indexKey: string) => {
  needScrolling.value = true;
  activeItemIndex.value = indexKey;
});

// @Methods:
const onDocumentScroll = () => {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(watchScrollEnd, 100);
  scrollCursor = document.documentElement.scrollTop || document.body.scrollTop;

  // debounce for getting active heading key
  if (rafTimer) {
    window.cancelAnimationFrame(rafTimer);
  }
  rafTimer = window.requestAnimationFrame(() => {
    // 获取当前文档流的 scrollTop
    const scrollTop = (document.documentElement.scrollTop || document.body.scrollTop);
    // 找该点亮的 heading
    for (let n = 0; n < headingRefs.value.length; n++) {
      // 如果 scrollTop 大于或等于索引 n 元素的 offsetTop
      // 则说明 n-1 的内容已经完全不可见
      // 那么此时导航索引就应该是 n 了
      if (scrollTop >= headingRefs.value[n].offsetTop - headingRefs.value[n].clientHeight) {
        activeItemIndex.value = tocItemRefs.value[n].dataset.tocIndex!;
      }
    }
  });
};
const watchScrollEnd = () => {
   scrollSnapshot = document.documentElement.scrollTop || document.body.scrollTop;
   if(scrollSnapshot === scrollCursor){
     needScrolling.value = false;
   }
};

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
  width: 170px;
  height: 100%;
  position: sticky;
  border-left: 2px solid #dee0e3;
}
</style>
