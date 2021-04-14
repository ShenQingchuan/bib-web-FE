<template>
  <div class="flex-col anis-center page-not-found__wrapper">
    <common-header consice />
    <div class="page-not-found__container">
      <h3 class="page-not-found__title">抱歉，页面无法访问</h3>
      <p class="page-not-found__error-content">页面链接可能已失效或被删除…</p>
    </div>
  </div>
</template>

<script lang="ts">
import CommonHeader from "@/components/page-header/common-header.vue";

export default {
  name: "not-found-page",
  components: {
    CommonHeader
  }
};
</script>

<style lang="less" scoped>
@import "../less/color.less";

.page-not-found__wrapper {
  width: 100vw;
  height: 100vh;
  background: url("/assets/img/background-page-404.png") no-repeat bottom;
  background-size: 100% auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.page-not-found__container {
  padding: 60px 0;
  user-select: none;

  .page-not-found__title {
    margin-top: 64px;
    font-size: 38px;
  }
  .page-not-found__error-content {
    text-align: center;
    font-size: 16px;
    color: @N500;
  }
}
</style>
