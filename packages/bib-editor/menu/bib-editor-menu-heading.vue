<template>
  <div class="bib-editor-menu-item__wrapper p-t-2 m-l-10">
    <a-dropdown>
      <a
        class="flex-row anis-center bib-editor-menu-item__display-level-label m-r-10"
        @click="(e) => e.preventDefault()"
      >
        <div class="text m-r-10">{{ displayText }}</div>
        <CaretDownOutlined></CaretDownOutlined>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item
            v-for="level in Object.keys(DisplayLevelEnum)"
            :key="level"
            class="m-tb-6"
            :class="[
              level === 'PLAIN'
                ? 'fs-12'
                : `fs-${DisplayLevelEnum[level].fs} fw-700`
            ]"
            @click="toggleHeaderLevel(DisplayLevelEnum[level])"
          >
            <span class="p-tb-6">{{ DisplayLevelEnum[level].label }}</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { setBlockType } from 'prosemirror-commands';
import { EditorSchema } from "../editor-schema";
import { trKeyHeading } from '../trKeys';
import { findParentNode } from "prosemirror-utils";
import type { EditorInstance } from "../typings";

type DisplayLevelEnumItem = { label: string, fs?: number, attrs?: { level: number } };
const DisplayLevelEnum: Record<string, DisplayLevelEnumItem> = {
  PLAIN: { label: "正文", },
  H1: { label: "标题 1", fs: 28, attrs: { level: 1 } },
  H2: { label: "标题 2", fs: 24, attrs: { level: 2 } },
  H3: { label: "标题 3", fs: 20, attrs: { level: 3 } },
  H4: { label: "标题 4", fs: 16, attrs: { level: 4 } },
  H5: { label: "标题 5", fs: 14, attrs: { level: 5 } },
}

// @States:
const displayLevel = ref(0);
const displayText = computed(() => {
  return (!displayLevel.value
    ? DisplayLevelEnum.PLAIN.label
    : DisplayLevelEnum[`H${displayLevel.value}`].label);
});
const editorInstance = inject<EditorInstance>("editorInstance")!;

// @LifeCycles:
onMounted(() => {
  editorInstance.onEditorDispatched((tr) => {
    if (tr.getMeta('trKey') === trKeyHeading) {
      displayLevel.value = tr.getMeta("level");
      return;
    }

    const { selection } = editorInstance.view.state;
    const heading = findParentNode(node => node.type === EditorSchema.nodes.heading)(selection);
    if (heading) {
      displayLevel.value = heading.node.attrs.level;
    } else {
      displayLevel.value = 0;
    }
  })
});

// @Methods:
const toggleHeaderLevel = (it: DisplayLevelEnumItem) => {
  if (!it.fs && !it.attrs) { // 切换为正文
    setBlockType(EditorSchema.nodes.paragraph)(
      editorInstance!.view.state,
      editorInstance!.view.dispatch
    );
    displayLevel.value = 0;
  } else {
    editorInstance?.toggleHeading(it.attrs!);
    displayLevel.value = it.attrs!.level;
  }
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
.bib-editor-menu-item {
  &__display-level-label {
    &,
    & .text {
      color: @N600;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
