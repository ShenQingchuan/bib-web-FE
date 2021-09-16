<template>
  <a-dropdown overlayClassName="bib-editor__code-block-lang-switcher-overlay">
    <div class="bib-editor__code-block-lang-switcher code-style-text">
      {{ `language: ${displayLangSpec}` }}
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

<script setup lang="tsx">
import { computed } from "vue";
import { supportLangs } from "@/components/BibEditor/node-views/code-block-view";

const props = defineProps<{
  lang: string;
  setLangSpec: (s: string) => void;
}>();

const capitalizeLangSpec = (str: string) => str[0].toUpperCase() + str.slice(1);
const displayLangSpec = computed(() =>
  props.lang ? capitalizeLangSpec(props.lang) : "Plain Text"
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
