<template>
  <div class="flex-col center-big-card-layout__wrapper">
    <div class="center-big-card-layout__container m-t-20 p-t-32">
      <div class="center-big-ceard-layout__header">
        <slot name="header">
          <div class="flex-row anis-center">
            <span class="center-big-card-layout__title fw-500 fs-16">{{ title }}</span>
            <span class="center-big-card-layout__desc m-l-20 fs-12">{{ description }}</span>
          </div>
        </slot>
      </div>

      <div class="center-big-card-layout__card flex-row m-t-10 p-32">
        <slot name="center"></slot>
      </div>

      <div class="center-big-card-layout__footer m-t-20">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
// @States:

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
@import "@/less/color.less";

.center-big-card-layout__wrapper {
  background-color: @N50;
  min-height: calc(100vh - 68px);
}
.center-big-card-layout__container {
  margin: 0 auto;
  max-width: 1056px;
}
.center-big-card-layout__card {
  width: 1024px;
  height: auto;
  min-height: 520px;
  border: 1px solid @N200;
  border-radius: 4px;
  background: #fff;
}
.center-big-card-layout__desc {
  color: @N500;
}
</style>
