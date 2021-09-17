<template>
  <a-dropdown overlayClassName="bib-editor__code-block-lang-switcher-overlay" trigger="click">
    <div class="bib-editor__code-block-lang-switcher code-style-text">
      {{ `language: ${displayLangSpec}` }}
      <DownOne
        theme="filled"
        class="bib-editor__code-block-lang-switcher-arrow iconpark"
      />
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="lang in supportLangs" @click="setLangSpec(lang)">
          {{ lang }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed, Ref } from "vue";
import { supportLangs } from "@/components/BibEditor/node-views/code-block-view";
import { DownOne } from "@icon-park/vue-next";

const props = defineProps<{
  lang: Ref<string>;
  setLangSpec: (s: string) => void;
}>();

const capitalizeLangSpec = (str: string) => str[0].toUpperCase() + str.slice(1);
const displayLangSpec = computed(() =>
  props.lang.value ? capitalizeLangSpec(props.lang.value) : "Plain Text"
);
</script>

<style lang="less">
.bib-editor__code-block-lang-switcher {
  position: absolute;
  left: 0;
  top: -27px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  width: fit-content;
  background-color: rgb(222 239 253);
  color: #4e4f4f;
  padding: 2px 6px;
  font-size: 14px;
  z-index: 3;
  user-select: none;
}
.bib-editor__code-block-lang-switcher-overlay {
  border: 0.5px #eeeeee solid;
  max-height: 300px;
  overflow: auto;
  z-index: 19;
}
</style>
