<template>
  <div class="dashboard-page__doc-list-wrapper flex-row anis-center p-12">
    <!-- 最近文档列表 -->
    <div class="dashboard-page__doc-list flex-col flex-1">
      <div class="flex-row anis-center m-b-16">
        <h2 class="inline m-b-0">我的文档</h2>
        <a-dropdown class="m-l-auto">
          <span class="doc-list-filter__text">
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
          <div
            v-for="doc in filteredDocList"
            :key="doc.createTime"
            class="dashboard-page__doc-list-item flex-row anis-center p-tb-14 p-lr-10"
          >
            <img src="/assets/svg/dashboard__doc-icon.svg" width="24" height="24" />
            <a
              class="dashboard-page__doc-list-item-title m-l-24 fs-14"
              :href="`/doc/${doc.id}`"
            >{{ doc.title }}</a>
            <a-tooltip placement="top" title="编辑">
              <img
                src="/assets/svg/dashboard__doc-edit.svg"
                alt="doc-edit"
                class="dashboard-page__doc-list-item-edit-icon m-l-12"
                @click="$router.push(`/doc/${doc.id}/edit`)"
              />
            </a-tooltip>

            <div class="dashboard-page__doc-list-item-meta-info flex-row anis-center m-r-12">
              <doc-belong-breadcrumb class="belong m-r-24 inline-block" :doc="doc" />
              <span class="create-time">{{ formatTime(doc.createTime) }}</span>
            </div>
          </div>
        </template>
      </a-skeleton>
    </div>

    <!-- 新建 -->
    <div class="dashboard-page__new-wrapper ansf-start flex-col m-l-48">
      <h3 class="m-t-6">新建</h3>
      <a-divider class="m-tb-2" />
      <div class="dashboard-page__new flex-row anis-center p-tb-12">
        <div
          v-for="item in NewActionList"
          :key="item.text"
          class="dashboard-page__new-item flex-col anis-center"
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
import { usePayloadFromToken } from "@/utils";
import { DownOutlined } from "@ant-design/icons-vue"
import { DocListItemArchiveType } from './common';
import DocBelongBreadcrumb from "./doc-belong-breadcrumb.vue";
import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
import type { DocListItem, DocFilter } from "./common";
import type { DocumentViewData } from "@/models";
import { message } from "ant-design-vue";

dayjs.locale('zh-cn');

export default defineComponent({
  name: "dashboard-index-subpage",
  components: {
    DocBelongBreadcrumb,
    DownOutlined
  },
  setup() {
    const docList = ref<DocListItem[]>([]);
    const listLoading = ref(false);
    const filterType = ref(-1);
    const filterName = ref('归属');
    const docListPage = ref(0);
    const docListPageTotal = ref(0);

    const router = useRouter();
    const tokenPayload = usePayloadFromToken()!;

    const filters: DocFilter[] = [
      { archiveType: -1, text: '所有' },
      { archiveType: DocListItemArchiveType.UserOnly, text: '个人空间' },
      { archiveType: DocListItemArchiveType.UserWiki, text: '个人知识库' },
      { archiveType: DocListItemArchiveType.OrgWiki, text: '团队知识库' }
    ];
    const NewActionList = [
      {
        id: 0,
        text: "新建文档",
        icon: "/assets/img/Icon-png-new-doc.png",
        onclick: () => {
          message.loading("初始化新文档中，请稍候...");
          fusions.post('/docs/new', {
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
      },
      {
        id: 2,
        text: "新建团队",
        icon: "/assets/svg/user-action__new__org.svg",
      }
    ];

    const fetchDocList = () => {
      if (docListPage.value > 0) {
        listLoading.value = true;
      }
      fusions.get(`/docs/myList?userId=${tokenPayload.userId}&pageNum=${docListPage.value}`)
        .then(res => {
          docList.value.push(...res.data.data.items);
          if (docListPage.value === 0) {
            docListPageTotal.value = res.data.data.pageTotal;
          }

          listLoading.value = false;
          docListPage.value += 1;
        });
    }
    onMounted(() => {
      fetchDocList();
    });

    const formatTime = (timestamp: number) => {
      return dayjs(timestamp).format('YYYY/MM/DD HH:mm:ss');
    }
    const filteredDocList = computed(() => {
      if (filterType.value === -1) {
        return docList.value
      }
      return docList.value.filter(doc => doc.archiveType === filterType.value)
    })
    const setFilter = (f: DocFilter) => {
      filterType.value = f.archiveType;
      filterName.value = f.text;
    }

    return {
      filteredDocList,
      listLoading,
      formatTime,
      filterType,
      filters,
      setFilter,
      filterName,
      NewActionList
    };
  }
});
</script>

<style lang="less" scoped>
@import "../../less/color.less";
.dashboard-page__doc-list-wrapper {
  .dashboard-page__doc-list {
    &-item {
      border-top: 1px solid #80808012;
      user-select: none;

      &:last-child {
        border-bottom: 1px solid #80808012;
      }

      &:hover {
        background-color: #fafafa;
        border-radius: 6px;

        .dashboard-page__doc-list-item-edit-icon {
          visibility: visible;
        }
      }
    }
  }
}

.dashboard-page__doc-list-item-meta-info {
  margin-left: auto;
  color: @N500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-page__doc-list-item-title {
  color: @N800;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: @primary-color;
  }
}

.dashboard-page__doc-list-item-edit-icon {
  width: 16px;
  height: 16px;
  visibility: hidden;
  cursor: pointer;
}

.doc-list-filter__text,
.dashboard-page__new-item {
  cursor: pointer;
  color: @N500;
}
</style>
