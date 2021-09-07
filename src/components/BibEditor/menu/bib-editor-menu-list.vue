<template>
  <div class="bib-editor-menu-item__wrapper m-lr-10">
    <a-button
      v-for="e in listMenuEnums"
      :key="e.name"
      class="bib-editor-menu-item__list-btn"
      :class="{
        active: activeList === e.name
      }"
      type="link"
      @click="toggleListType(e.listType, e.itemType)"
    >
      <template #icon>
        <component :is="e.icon"></component>
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
import type { EditorInstance } from "../typings";
import { guardYjsTrascationEvent } from "../utils";

// @States:
const editorInstance = inject<EditorInstance>("editorInstance")!;
const { bullet_list, ordered_list, task_list, list_item, task_item } = EditorSchema.nodes;
const listMenuEnums = [
  { name: 'ordered_list', icon: OrderedListOutlined, listType: ordered_list, itemType: list_item },
  { name: 'bullet_list', icon: UnorderedListOutlined, listType: bullet_list, itemType: list_item },
  { name: 'task_list', icon: CheckSquareOutlined, listType: task_list, itemType: task_item }
];
const activeList = ref("none");

// @LifeCycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (guardYjsTrascationEvent(tr)) return;
    editorInstance.applyForNodesAtCursor((currentNode) => {
      const hasListTypeParent = findParentNode(node => listTypeNames.includes(node.type.name))(
        editorInstance.view.state.selection
      )
      if (listTypeNames.includes(currentNode.type.name)) {
        activeList.value = currentNode.type.name;
      }
      if (!hasListTypeParent && activeList.value !== 'none') {
        activeList.value = "none";
      }
    });
  });
})

// @Methods:
const toggleListType = (listType: NodeType, itemType: NodeType) => {
  editorInstance?.toggleList(listType, itemType);
  editorInstance?.focus();
  activeList.value = listType.name;
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__list-btn {
    .menu-btn-common;
  }
}
</style>
