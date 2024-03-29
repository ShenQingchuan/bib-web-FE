<template>
  <div class="bib-editor-menu-item__wrapper flex-row anis-center p-lr-2">
    <a-dropdown class="bib-editor-menu-item__image-dropdown">
      <a-button class="bib-editor-menu-item__image-btn p-lr-4" type="link">
        <Icon :component="insertImageIcon" />
      </a-button>
      <template #overlay>
        <div
          class="bib-editor-menu-item__image-dropdown-overlay flex-col anis-center p-tb-4 p-lr-6"
        >
          <div
            class="bib-editor-menu-item__image-dropdown-overlay-item p-tb-4 p-lr-6 m-tb-4"
            @click="insertImage('local')"
          >
            <DesktopOutlined />
            <span class="m-l-10">本地图片</span>
            <input
              class="bib-editor__local-image-inputer"
              ref="localImageInputer"
              type="file"
              accept=".svg, .png, .bmp, .jpg, .jpeg, .gif, .tif, .tiff, .emf, .webp"
              @change="onLocalImageInput"
            />
          </div>
          <div
            class="bib-editor-menu-item__image-dropdown-overlay-item p-tb-4 p-lr-6 m-tb-4"
            @click="insertImage('online')"
          >
            <GlobalOutlined />
            <span class="m-l-10">在线图片</span>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import Icon, { DesktopOutlined, GlobalOutlined } from '@ant-design/icons-vue';
import insertImageIcon from '@editor/icons/insert-image-icon.vue';
import { fusions } from '@/fusions';
import {
  usePayloadFromToken,
  cosImageURLPrefix,
  cosImageUploadLoadingKey,
  multiplePartFormContentType
} from '@/utils';
import { message } from 'ant-design-vue';
import { trKeyInsertImage } from '@editor/trKeys';
import { EditorSchema } from '@editor/schemas';
import type { EditorInstance, InsertImageType } from '@editor/typings';

// @States:
const editorInstance = inject<EditorInstance>("editorInstance")!;
const localImageInputer = ref<HTMLInputElement | null>(null);

// @LifeCycles:

// @Methds:
const insertImage = (insertType: InsertImageType) => {
  editorInstance?.insertImage(insertType);
}
const onLocalImageInput = () => {
  const tokenPayload = usePayloadFromToken();
  if (tokenPayload && localImageInputer.value?.files) {
    const images = localImageInputer.value.files;
    let formData = new FormData();

    message.loading({
      content: '图片上传中，请稍候...',
      key: cosImageUploadLoadingKey
    });
    formData.append("uploadImages", images[0]);
    formData.append("userId", `${tokenPayload.userId}`);
    fusions.post('/docs/uploadImages', formData, {
      headers: {
        "Content-Type": multiplePartFormContentType,
      }
    }).then((res) => {
      // 本地图片上传成功
      message.success({
        content: res.data.message,
        key: cosImageUploadLoadingKey
      });
      const r: { key: string, putObjectResult: any } = res.data.data.uploadResults[0];
      const src = `${cosImageURLPrefix}${r.key}`;

      const { tr } = editorInstance.view.state;
      tr.replaceSelectionWith(
        EditorSchema.nodes.image.create({ src })
      )
      tr.setMeta('trKey', trKeyInsertImage);
      editorInstance.view.dispatch(tr);
    })
  }
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";
@import "./menu-btn-common.less";
.bib-editor-menu-item {
  &__image-btn {
    .menu-btn-common;
  }
}
.bib-editor-menu-item__image-dropdown-overlay {
  border-radius: 2px;
  outline: none;
  box-shadow: 0 2px 10px @N400;
  transition: all 0.25s cubic-bezier(0.3, 1.2, 0.2, 1);
  background-color: white;

  &-item {
    cursor: pointer;
  }
}
</style>

<style lang="less">
.bib-editor__local-image-inputer {
  display: none;
}
</style>