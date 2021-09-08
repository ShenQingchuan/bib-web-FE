<template>
  <div class="flex-col vc center-small-card-layout__out-wrapper">
    <div class="flex-col vc center-small-card-layout__container">
      <img
        src="/assets/img/Icon-png-logo-raw.png"
        alt="login page logo"
        width="64"
      />
      <template v-if="!noTitle">
        <img
          src="/assets/img/Icon-png-logo-text.png"
          alt="login page title"
          height="38"
        />
        <div class="center-small-card-layout__subtitle">
          开源的云端知识库
        </div>
      </template>

      <!-- 登录表单 -->
      <slot name="center"></slot>

      <!-- 表单 footer actions -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  noTitle?: boolean
}>();
</script>

<style lang="less" scoped>
@import url("@/less/color.less");

.center-small-card-layout__out-wrapper {
  background-color: @N50;
  min-height: 100vh;

  .center-small-card-layout__container {
    width: 500px;
    background: @N00;
    box-shadow: 0 5px 10px @N50;
    padding: 40px 8px 16px;
    margin-bottom: 64px;
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    user-select: none;

    img:nth-child(1) {
      margin: 10px 0;
    }
    img:nth-child(2) {
      margin: 0 0 4px 0;
    }

    .center-small-card-layout__subtitle {
      font-weight: 300;
      font-size: 20px;
      margin-bottom: 20px;
    }
  }
}
</style>
