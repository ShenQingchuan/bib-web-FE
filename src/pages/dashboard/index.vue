<template>
  <div class="dashboard-page__doc-list-wrapper p-12">
    <div class="dashboard-page__doc-list flex-col">
      <h2>文档列表</h2>
      <div
        v-for="doc in docList"
        :key="doc.createTime"
        class="dashboard-page__doc-list-item flex-row anis-center p-tb-12 p-lr-10 m-tb-6"
      >
        <img src="/assets/svg/dashboard__doc.svg" width="24" height="24" />
        <div class="dashboard-page__doc-list-item-title m-l-24 fs-14">{{ doc.title }}</div>

        <div class="dashboard-page__doc-list-item-meta-info m-r-12">
          <span class="belong m-r-48">{{ doc.creatorName }}</span>
          <span class="create-time">{{ formatTime(doc.createTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import mocker from "../../fusions/mocker";
import { defineComponent, ref, onMounted } from "vue";
import * as dayjs from "dayjs";
import 'dayjs/locale/zh-cn' // 导入本地化语言
dayjs.locale('zh-cn');

interface DocListItem {
  title: string;
  creatorId: number;
  creatorName: string;
  createTime: number;
  archiveType: 0 | 1;
  wikiId?: number;
  wikiName?: string;
}

export default defineComponent({
  name: "dashboard-index-subpage",
  setup() {
    const docList = ref<DocListItem[]>([]);

    onMounted(() => {
      mocker.get('/dashboard/docList').then(res => {
        docList.value = res.data.data.docList;
      });
    })

    const formatTime = (timestamp: number) => {
      return dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm:ss');
    }

    return {
      docList,
      formatTime
    };
  }
});
</script>

<style lang="less" scoped>
@import "../../less/color.less";
.dashboard-page__doc-list-wrapper {
  max-width: 900px;
  .dashboard-page__doc-list {
    &-item {
      &:hover {
        background-color: #fafafa;
        border-radius: 6px;
      }

      &-meta-info {
        margin-left: auto;
        color: @N500;
      }
    }
  }
}
</style>
