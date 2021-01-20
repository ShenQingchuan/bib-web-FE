<template>
  <div class="flex-col jyct-start page-dashboard__container">
    <common-header />
  </div>
</template>

<script lang="ts">
import CommonHeader from "../components/page-header/common-header.vue";

export default {
  name: "dashboard-page",
  components: {
    CommonHeader
  }
};
</script>

<style lang="less" scoped>
.page-dashboard__container {
  min-height: 100vh;
}
</style>
