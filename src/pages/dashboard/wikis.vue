<template>
  <div class="page-dashboard__wikis-wrapper flex-col p-12">
    <div class="page-dashboard__wikis-list-header flex-row anis-center">
      <h2 class="m-b-0">我参与的知识库</h2>
      <a-dropdown class="m-l-auto m-r-16">
        <span class="wiki-list-filter__text cursor-ptr tc-n500">
          {{ filterName }}
          <DownOutlined />
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item
              v-for="f in filters"
              :key="f.wikiType || '-'"
              @click="setFilter(f)"
            >{{ f.text }}</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- 知识库列表 view -->
    <div class="page-dashboard__wiki-list flex-col p-tb-16">
      <a-skeleton active :loading="wikiListLoading">
        <a-empty v-if="filteredWikiList.length === 0" description="暂时还没有文档..." />
        <template v-else>
          <wiki-list-item v-for="wiki in filteredWikiList" :key="wiki.id" :wiki="wiki" />
          <div class="w-p100 flex-row anis-center jyct-center">
            <a-button v-if="wikiListPage !== wikiListPageTotal" @click="fetchDocList">加载更多</a-button>
          </div>
        </template>
      </a-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';
import { wikiTypeFilters as filters } from '@/components/page-dashboard/common';
import { fusions } from '@/fusions';
import { usePayloadFromToken } from '@/utils';
import WikiListItem from '@/components/page-dashboard/wiki-list-item.vue';
import type { WikiFilter, WikiType, WikiListItemData } from '@/components/page-dashboard/common';

const tokenPayload = usePayloadFromToken()!;

// @States:
const filterName = ref('归属');
const filterType = ref<WikiType>();
const wikiListLoading = ref(false);
const wikiList = ref<WikiListItemData[]>([]);
const wikiListPage = ref(0);
const wikiListPageTotal = ref(0);
const filteredWikiList = computed(() => {
  return wikiList.value;
});


// @Methods:
const setFilter = (f: WikiFilter) => {
  filterType.value = f.wikiType;
  filterName.value = f.text;
}
const fetchDocList = () => {
  if (wikiListPage.value === 0) {
    wikiListLoading.value = true;
  }
  fusions.get(`/wiki/myAll?userId=${tokenPayload.userId}&pageNum=${wikiListPage.value}`)
    .then(res => {
      wikiList.value.push(...res.data.data.items);
      wikiList.value.sort((a, b) => b.updateTime - a.updateTime);
      if (wikiListPage.value === 0) {
        wikiListPageTotal.value = res.data.data.pageTotal;
        wikiListLoading.value = false;
      }

      wikiListPage.value += 1;
    });
}

// @LifeCycels:
onMounted(() => {
  fetchDocList();
});
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "@/components/page-dashboard/common.less";

.page-dashboard__wikis-list-header,
.page-dashboard__wiki-list {
  max-width: 1024px;
}
</style>
