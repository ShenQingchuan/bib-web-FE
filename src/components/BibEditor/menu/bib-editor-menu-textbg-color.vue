<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center m-lr-2">
    <a-button
      type="link"
      class="bib-editor-menu-item__textbg-color-btn p-lr-6"
      @click="onColorChange(pickedColor)"
    >
      <svg class="icon" width="16px" height="16px" viewBox="0 0 16 16" version="1.1">
        <title>text-highlight</title>
        <desc>Bib Editor Text Background Color Picker.</desc>
        <g id="highlight" stroke-width="1" fill="none" fill-rule="evenodd">
          <rect
            :fill="showColorForSvg"
            :stroke="showColorForSvg"
            id="Rectangle-55"
            stroke-width="0.5"
            x="2"
            y="12.75"
            width="12"
            height="1.5"
            rx="0.125"
          />
          <g id="Group-2" transform="translate(2.781250, 1.375000)" fill-rule="nonzero">
            <path
              fill="#595959"
              d="M2.86079849,6.64817222 L2.05713835,5.84451208 C2.00832281,5.79569655 2.00832281,5.71655092 2.05713835,5.66773539 L3.61029491,4.11457882 L3.11963835,3.62392225 C3.07082281,3.57510672 3.07082281,3.49596109 3.11963835,3.44714556 L6.47839556,0.0883883476 C6.52721109,0.0395728112 6.60635672,0.0395728112 6.65517225,0.0883883476 L11.5165314,4.94974747 C11.5653469,4.998563 11.5653469,5.07770863 11.5165314,5.12652416 L8.15777416,8.48528137 C8.10895863,8.53409691 8.029813,8.53409691 7.98099747,8.48528137 L7.38889678,7.89318068 L5.83574021,9.44633725 C5.78692467,9.49515278 5.70777905,9.49515278 5.65896351,9.44633725 L5.0267407,8.81411444 L4.48856529,9.35326519 C4.39477378,9.44720966 4.26747335,9.5 4.13472392,9.5 L0.608857988,9.5 C0.470786801,9.5 0.358857988,9.38807119 0.358857988,9.25 C0.358857988,9.18363253 0.385247413,9.11998865 0.432210608,9.07309408 L2.86079849,6.64817222 Z M6.56678391,1.67937861 L4.71062861,3.53553391 L8.06938582,6.89429112 L9.92554112,5.03813582 L6.56678391,1.67937861 Z M3.64812861,5.75612373 L5.74735186,7.85534699 L6.54284699,7.05985186 L4.44362373,4.96062861 L3.64812861,5.75612373 Z"
              id="Combined-Shape"
            />
          </g>
        </g>
      </svg>
    </a-button>
    <a-popover v-model:visible="pickerVisible" trigger="click" placement="bottomLeft">
      <div class="arrow flex-row anis-center p-lr-4">
        <DownOutlined class="arrow-icon" />
      </div>
      <template #content>
        <fk-color-picker
          disable-clipboard
          :display-current-color="false"
          :format="'hex8'"
          v-model:color="pickedColor"
          @update:color="onColorChange"
        />
      </template>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';
import { EditorSchema } from "../editor-schema"
import type { EditorComposable } from "../typings";

const defaultColor = '#00000000';
// @States:
const pickedColor = ref(defaultColor);
const pickerVisible = ref(false);
const editorCompose = inject<EditorComposable>("editorCompose");
const updating = ref(false);
const showColorForSvg = computed(() =>
  pickedColor.value === '#00000000'
    ? defaultColor
    : pickedColor.value
);

// @lifeCycles:
onMounted(() => {
  editorCompose?.onEditorDispatched((tr) => {
    editorCompose.applyForNodesAtCursor((node) => {
      if (!tr.getMeta("pointer") && node.type === EditorSchema.nodes.text) {
        const hightlightedMarkType = EditorSchema.marks.hightlighted;
        if (
          node.marks.map(m => m.type).includes(hightlightedMarkType)
          || tr.storedMarks?.map(m => m.type).includes(hightlightedMarkType)
        ) {
          const mark = node.marks.find(m => m.type === hightlightedMarkType);
          if (mark) {
            pickedColor.value = mark.attrs.color;
          }
        }
        else if (!updating.value && pickedColor.value !== defaultColor) {
          pickedColor.value = defaultColor;
        }
      }
    });
  });
});

// @Methods:
const onColorChange = (newColor: string) => {
  updating.value = true;
  editorCompose?.toggleTextBgColor(
    newColor !== defaultColor
      ? newColor
      : defaultColor
  );
  updating.value = false;
  pickerVisible.value = false;
  editorCompose?.focus();
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__textbg-color-btn {
    .menu-btn-common;
    .icon {
      position: relative;
      top: 5px;
    }
  }
}
.arrow {
  font-size: 10px;
  height: 30px;
  cursor: pointer;
  &:hover {
    background-color: @N200;
    border-radius: 6px;
  }

  .arrow-icon {
    position: relative;
    top: 1px;
  }
}
</style>
