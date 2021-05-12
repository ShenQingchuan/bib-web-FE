<template>
  <div
    class="page-dashboard__index-index-doc-list-wrapper flex-row anis-center p-12"
  >
    <!-- 最近文档列表 -->
    <div class="page-dashboard__index-index-doc-list flex-col flex-1">
      <div class="flex-row anis-center m-b-16">
        <h2 class="inline m-b-0">近期参与文档</h2>
        <a-dropdown class="m-l-auto">
          <span class="doc-list-filter__text cursor-ptr tc-n500">
            {{ filterName }}
            <DownOutlined />
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="f in filters"
                :key="f.archiveType || '-'"
                @click="setFilter(f)"
                >{{ f.text }}</a-menu-item
              >
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <a-skeleton active :loading="listLoading">
        <a-empty
          v-if="filteredDocList.length === 0"
          description="暂时还没有文档..."
        />
        <template v-else>
          <doc-list-item-view
            v-for="doc in filteredDocList"
            :key="doc.createTime"
            :doc-item="doc"
          />
          <div class="w-p100 flex-row anis-center jyct-center">
            <a-button
              v-if="docListPage !== docListPageTotal"
              @click="fetchDocList"
              >加载更多</a-button
            >
          </div>
        </template>
      </a-skeleton>
    </div>

    <!-- 新建 -->
    <div class="page-dashboard__index-new-wrapper ansf-start flex-col m-l-48">
      <h3 class="m-t-6">新建</h3>
      <a-divider class="m-tb-2" />
      <div class="page-dashboard__index-new flex-row anis-center p-tb-12">
        <div
          v-for="item in NewActionList"
          :key="item.text"
          class="cursor-ptr tc-n500 flex-col anis-center"
          :class="{
            'm-l-4': item.id === 0,
            'm-lr-36': item.id === 1,
            'm-r-4': item.id === 2
          }"
          @click="item.onclick"
        >
          <img :src="item.icon" width="24" height="24" />
          <span class="m-t-10 to-ellipsis text-noselect">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { fusions } from "../../fusions";
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { DownOutlined } from "@ant-design/icons-vue";
import { usePayloadFromToken } from "@/utils";
import { DocListItemArchiveType, docListItemFilters as filters } from '@/components/page-dashboard/common';
import { message } from "ant-design-vue";
import DocListItemView from '@/components/page-dashboard/doc-list-item.vue';
import type { DocListItem, DocFilter } from "@/components/page-dashboard/common";
import type { DocumentViewData } from "@/models";

export default defineComponent({
  name: "dashboard-index-subpage",
  components: {
    DocListItemView,
    DownOutlined,
  },
  setup() {
    const docList = ref<DocListItem[]>([]);
    const listLoading = ref(false);
    const filterType = ref<DocListItemArchiveType>();
    const filterName = ref('归属');
    const docListPage = ref(0);
    const docListPageTotal = ref(0);

    const router = useRouter();
    const tokenPayload = usePayloadFromToken()!;

    const NewActionList = [
      {
        id: 0,
        text: "新建文档",
        icon: "/assets/img/Icon-png-new-doc.png",
        onclick: () => {
          message.loading("初始化新文档中，请稍候...");
          fusions.post('/docs/', {
            userId: tokenPayload.userId
          }).then(resp => {
            if (resp.data.responseOk) {
              const newDocViewData = resp.data.data as DocumentViewData
              router.push(`/doc/${newDocViewData.id}/edit`).then(() => message.destroy());
            }
          })
        }
      },
      {
        id: 1,
        text: "新建知识库",
        icon: "/assets/svg/user-action__new__book.svg",
        onclick: () => {
          router.push('/wiki/new');
        }
      },
      {
        id: 2,
        text: "新建团队",
        icon: "/assets/svg/user-action__new__org.svg",
        onclick: () => {
          router.push('/org/new');
        }
      }
    ];

    const fetchDocList = () => {
      if (docListPage.value === 0) {
        listLoading.value = true;
      }
      fusions.get(`/docs/myList?userId=${tokenPayload.userId}&pageNum=${docListPage.value}`)
        .then(res => {
          docList.value = [
            ...docList.value,
            ...res.data.data.items
          ];
          docList.value.sort((a, b) => b.updateTime - a.updateTime);
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

    const filteredDocList = computed(() => {
      if (!filterType.value) {
        return docList.value
      }
      return docList.value.filter(doc => doc.archiveType === filterType.value)
    });
    const setFilter = (f: DocFilter) => {
      filterType.value = f.archiveType;
      filterName.value = f.text;
    };

    return {
      filteredDocList,
      listLoading,
      filterType,
      filters,
      setFilter,
      filterName,
      NewActionList,
      docListPage,
      docListPageTotal,
      fetchDocList
    };
  }
});
</script>
