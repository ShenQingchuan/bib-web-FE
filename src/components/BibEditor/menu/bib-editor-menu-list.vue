<template>
  <div class="bib-editor-menu-item__wrapper m-lr-10">
    <a-button
      v-for="item in listMenuItems"
      :key="item.name"
      class="bib-editor-menu-item__list-btn"
      :class="{
        active: activeList === item.name
      }"
      type="link"
      @click="toggleListType(item.nodeType)"
    >
      <template #icon>
        <component :is="item.icon"></component>
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, computed } from "vue";
import { NodeType } from "prosemirror-model";
import { EditorSchema, listTypeNames } from '../editor-schema';
import {
  OrderedListOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined
} from '@ant-design/icons-vue';
import { findParentNode } from "prosemirror-utils";
import type { EditorComposable } from "../typings";

// @States:
const editorCompose = inject<EditorComposable>("editorCompose");
const { bullet_list, ordered_list, task_list } = EditorSchema.nodes;
const listMenuItems = [
  { name: 'ordered', icon: OrderedListOutlined, nodeType: ordered_list },
  { name: 'bullet', icon: UnorderedListOutlined, nodeType: bullet_list },
  { name: 'task', icon: CheckSquareOutlined, nodeType: task_list }
];
const activeList = ref<"none" | "ordered" | "bullet" | "task">("none");

// @LifeCycles:
onMounted(() => {
  editorCompose?.onEditorDispatched(() => {
    editorCompose.applyForNodesAtCursor((currentNode) => {
      const hasListTypeParent = findParentNode(node => listTypeNames.includes(node.type.name))(
        editorCompose.view.value.state.selection
      )
      if (listTypeNames.includes(currentNode.type.name)) {
        switch (currentNode.type.name) {
          case "ordered_list": {
            activeList.value = "ordered";
            return;
          }
          case "bullet_list": {
            activeList.value = "bullet";
            return;
          }
          case "task_list": {
            activeList.value = "task";
            return;
          }
        }
      }
      if (!hasListTypeParent && activeList.value !== 'none') {
        activeList.value = "none";
      }
    });
  });
})

// @Methods:
const toggleListType = (listType: NodeType) => {
  editorCompose?.toggleList(listType);
}
</script>

<style lang="less" scoped>
@import '../../../less/color.less';
.bib-editor-menu-item {
  &__list-btn {
    &,
    &:hover {
      border: none;
      color: @N600;
    }

    &:hover,
    &.active {
      background-color: @N200;
      border-radius: 6px;
    }
  }
}
</style>
