<template>
  <a-layout class="page-dashboard__container">
    <a-layout-header class="page-dashboard__header">
      <common-header />
    </a-layout-header>
    <a-layout>
      <a-layout-sider class="page-dashboard__side-navigator flex-col p-tb-24 p-lr-8" width="256px">
        <side-navigator-item link="/dashboard" label="工作台">
          <template #icon>
            <LaptopOutlined class="m-r-8" />
          </template>
        </side-navigator-item>
        <side-navigator-item link="/dashboard/collections" label="收藏">
          <template #icon>
            <StarOutlined class="m-r-8" />
          </template>
        </side-navigator-item>
        <side-navigator-item link="/dashboard/recycles" label="回收站">
          <template #icon>
            <DeleteOutlined class="m-r-8" />
          </template>
        </side-navigator-item>
      </a-layout-sider>
      <a-layout-content class="page-dashboard__content p-lr-32 p-tb-24">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { LaptopOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons-vue"
import CommonHeader from "@/components/page-header/common-header.vue";
import SideNavigatorItem from "./side-navigator-item.vue"

export default {
  name: "dashboard-page",
  components: {
    LaptopOutlined,
    StarOutlined,
    DeleteOutlined,
    CommonHeader,
    SideNavigatorItem
  }
};
</script>

<style lang="less" scoped>
@import "../../less/color.less";
.page-dashboard {
  &__container {
    min-height: 100vh;
  }
  &__header {
    padding: 0;
    height: 69px;
  }
  &__side-navigator {
    background-color: #fafafa;
    cursor: pointer;
    width: 256px;
    height: calc(100vh - 60px);
  }
  &__content {
    background-color: white;
  }
}
</style>
