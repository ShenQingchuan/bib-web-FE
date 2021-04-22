<template>
  <div class="dashboard-page__collections-doc-list-wrapper flex-row anis-center p-12">
    <!-- 最近文档列表 -->
    <div class="dashboard-page__collections-doc-list flex-col flex-1">
      <div class="flex-row anis-center m-b-16">
        <h2 class="inline m-b-0">点赞过的文档</h2>
        <a-dropdown class="m-l-auto">
          <span class="doc-list-filter__text cursor-ptr tc-n500">
            {{ filterName }}
            <DownOutlined />
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="f in filters"
                :key="f.archiveType"
                @click="setFilter(f)"
              >{{ f.text }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <a-skeleton active :loading="listLoading">
        <a-empty v-if="filteredDocList.length === 0" description="暂时还没有文档..." />
        <template v-else>
          <doc-list-item-view v-for="doc in filteredDocList" :key="doc.createTime" :doc-item="doc" />
          <div class="w-p100 flex-row anis-center jyct-center">
            <a-button v-if="docListPage !== docListPageTotal" @click="fetchDocList">加载更多</a-button>
          </div>
        </template>
      </a-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
import { DocListItemArchiveType, filters } from "@/components/page-dashboard/common";
import { fusions } from "@/fusions";
import { usePayloadFromToken } from "@/utils";
import DocListItemView from '@/components/page-dashboard/doc-list-item.vue';
import { DownOutlined } from '@ant-design/icons-vue';
import type { DocListItem, DocFilter } from "@/components/page-dashboard/common";

dayjs.locale('zh-cn');

const tokenPayload = usePayloadFromToken()!;

// @States:
const docList = ref<DocListItem[]>([]);
const listLoading = ref(false);
const filterType = ref<DocListItemArchiveType>();
const filterName = ref('归属');
const docListPage = ref(0);
const docListPageTotal = ref(0);

const filteredDocList = computed(() => {
  if (!filterType.value) {
    return docList.value
  }
  return docList.value.filter(doc => doc.archiveType === filterType.value)
})

// @Methods:
const setFilter = (f: DocFilter) => {
  filterType.value = f.archiveType;
  filterName.value = f.text;
}
const fetchDocList = () => {
  if (docListPage.value === 0) {
    listLoading.value = true;
  }
  fusions.get(`/docs/thumbsUpedList?userId=${tokenPayload.userId}&pageNum=${docListPage.value}`)
    .then(res => {
      docList.value.push(...res.data.data.items);
      if (docListPage.value === 0) {
        docListPageTotal.value = res.data.data.pageTotal;
        listLoading.value = false;
      }

      docListPage.value += 1;
    });
}
onMounted(() => {
  fetchDocList();
});
</script>

<style lang="less" scoped>
</style>
