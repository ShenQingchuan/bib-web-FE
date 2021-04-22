<template>
  <div
    class="page-dashboard__side-navigator-item flex-row anis-center p-tb-6 p-lr-16 m-b-4"
    :class="{
      'active': $route.fullPath === link
    }"
    @click="handleNavigation"
  >
    <slot name="icon"></slot>
    {{ label }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "side-navigator-item",
  props: {
    link: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    // @Methods:
    const handleNavigation = () => {
      router.push(props.link);
    }

    return {
      handleNavigation
    }
  }
});
</script>

<style lang="less" scoped>
@import "../../less/color.less";

.page-dashboard__side-navigator-item {
  color: @N650;
  &.active,
  &:hover {
    border-radius: 4px;
    background-color: #f5f5f5;
  }
}
</style>
