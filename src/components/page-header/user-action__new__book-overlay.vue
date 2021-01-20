<template>
  <a-menu class="component-user-action__new__book-overlay__menu">
    <a-menu-item
      v-for="item in linkItems"
      :key="item.text"
      class="flex-row anis-center component-user-action__new__book-overlay__menu-item"
    >
      <img :src="item.icon" width="16" height="16" />
      <span>{{ item.text }}</span>
    </a-menu-item>
  </a-menu>
</template>

<script lang="ts">
const linkItems = [
  {
    text: "新建文档",
    icon: "/assets/svg/user-action__new__doc.svg"
  },
  {
    text: "新建知识库",
    icon: "/assets/svg/user-action__new__book.svg"
  },
  {
    text: "新建团队",
    icon: "/assets/svg/user-action__new__org.svg"
  }
];

export default {
  name: "user-action__new__book-overlay",
  setup() {
    return {
      linkItems
    };
  }
};
</script>

<style lang="less" scoped>
.component-user-action__new__book-overlay__menu {
  position: relative;
  top: 6px;

  &-item {
    line-height: 30px;

    img {
      margin: 0 6px;
    }
  }
}
</style>
