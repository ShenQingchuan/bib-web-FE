<template>
  <div class="dashboard-page__doc-list-wrapper p-12">
    <div class="dashboard-page__doc-list flex-col">
      <div class="flex-row anis-center m-b-16">
        <h2 class="inline m-b-0">最近文档列表</h2>
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
        <a-empty v-if="filteredDocList.length === 0" />
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
  </div>
</template>

<script lang="ts">
import { mocker } from "../../fusions";
import { defineComponent, ref, onMounted, computed } from "vue";
import DocBelongBreadcrumb from "./doc-belong-breadcrumb.vue";
import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
import { DownOutlined } from "@ant-design/icons-vue"
import { DocListItemArchiveType } from './common';
import type { DocListItem, DocFilter } from "./common";

dayjs.locale('zh-cn');

const filters: DocFilter[] = [
  { archiveType: -1, text: '所有' },
  { archiveType: DocListItemArchiveType.UserOnly, text: '个人空间' },
  { archiveType: DocListItemArchiveType.UserWiki, text: '个人知识库' },
  { archiveType: DocListItemArchiveType.OrgOnly, text: '团队空间' },
  { archiveType: DocListItemArchiveType.OrgWiki, text: '团队知识库' }
]

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

    onMounted(() => {
      listLoading.value = true;
      mocker.get('/dashboard/docList').then(res => {
        docList.value = res.data.data;
        listLoading.value = false;
      });
    })

    const formatTime = (timestamp: number) => {
      return dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm:ss');
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
    };
  }
});
</script>

<style lang="less" scoped>
@import "../../less/color.less";
.dashboard-page__doc-list-wrapper {
  max-width: 940px;
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

.doc-list-filter__text {
  cursor: pointer;
  color: @N500;
}
</style>
