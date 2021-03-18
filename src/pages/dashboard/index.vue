<template>
  <div class="dashboard-page__doc-list-wrapper p-12">
    <div class="dashboard-page__doc-list flex-col">
      <h2>我的文档列表</h2>
      <a-skeleton active :loading="listLoading">
        <a-empty v-if="docList.length === 0" />
        <template v-else>
          <div
            v-for="doc in docList"
            :key="doc.createTime"
            class="dashboard-page__doc-list-item flex-row anis-center p-tb-14 p-lr-10"
          >
            <img src="/assets/svg/dashboard__doc.svg" width="24" height="24" />
            <div class="dashboard-page__doc-list-item-title m-l-24 fs-14">{{ doc.title }}</div>
            <a-tooltip placement="top" title="编辑">
              <img
                src="/assets/svg/dashboard__doc-edit.svg"
                alt="doc-edit"
                class="dashboard-page__doc-list-item-edit-icon m-l-12"
              />
            </a-tooltip>

            <div class="dashboard-page__doc-list-item-meta-info m-r-12">
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
import mocker from "../../fusions/mocker";
import { defineComponent, ref, onMounted } from "vue";
import DocBelongBreadcrumb from "./doc-belong-breadcrumb.vue";
import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
import type { DocListItem } from "./typings";

dayjs.locale('zh-cn');

export default defineComponent({
  name: "dashboard-index-subpage",
  components: {
    DocBelongBreadcrumb
  },
  setup() {
    const docList = ref<DocListItem[]>([]);
    const listLoading = ref(false);

    onMounted(() => {
      listLoading.value = true;
      mocker.get('/dashboard/docList').then(res => {
        docList.value = res.data.data.docList;
        listLoading.value = false;
      });
    })

    const formatTime = (timestamp: number) => {
      return dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm:ss');
    }

    return {
      docList,
      listLoading,
      formatTime,
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
}

.dashboard-page__doc-list-item-title {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-page__doc-list-item-edit-icon {
  width: 16px;
  height: 16px;
  visibility: hidden;
  cursor: pointer;
}
</style>
