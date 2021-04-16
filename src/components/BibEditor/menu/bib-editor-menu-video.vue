<template>
  <div class="bib-editor-menu-item flex-row anis-center p-lr-2">
    <a-dropdown class="bib-editor-menu-item__image-dropdown">
      <a-button type="link" class="bib-editor-menu-item__video-btn p-lr-4">
        <Video theme="outline" class="bib-editor-menu-item__video-btn-icon" />
      </a-button>
      <template #overlay>
        <div class="bib-editor-menu-item__video-dropdown-overlay flex-col p-tb-4 p-lr-6">
          <div
            class="bib-editor-menu-item__video-dropdown-overlay-item p-tb-4 p-lr-6 m-tb-4"
            v-for="t in videoTypes"
            :key="t.label"
            @click="editorInstance?.insertVideo(t.icon, t.label)"
          >
            <img :src="t.icon" :alt="t.label" width="20" />
            <span class="m-l-6 fs-12">{{ t.label }}</span>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { Video } from '@icon-park/vue-next';
import type { EditorInstance } from '../typings';

const videoTypes = [
  { icon: '/assets/svg/editor__video-bilibili.svg', label: '哔哩哔哩视频' },
  { icon: '/assets/svg/editor__video-youku.svg', label: '优酷视频' },
  { icon: '/assets/svg/editor__video-tencent.svg', label: '腾讯视频' },
  { icon: '/assets/svg/editor__video-iqiyi.svg', label: '爱奇艺视频' },
  { icon: '/assets/svg/editor__video-youtube.svg', label: 'Youtube 视频' },
]

// @States:
const editorInstance = inject<EditorInstance>("editorInstance")!;

// @LifeCycels:

// @Methods:

</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "@/less/shared.less";
@import "./menu-btn-common.less";

.bib-editor-menu-item {
  &__video-btn {
    .menu-btn-common;

    &-icon {
      .iconpark-fix;
    }
  }
}

.bib-editor-menu-item__video-dropdown-overlay {
  border-radius: 2px;
  outline: none;
  box-shadow: 0 2px 10px @N400;
  transition: all 0.25s cubic-bezier(0.3, 1.2, 0.2, 1);
  background-color: white;

  &-item {
    cursor: pointer;

    &:hover {
      background-color: @N100;
    }
  }
}
</style>
