<template>
  <bib-editor class="demo" :options="options" />
</template>

<script setup lang="ts">
import type { BibEditorOptions } from "../components/BibEditor/typings";
import BibEditor from "../components/BibEditor/index.vue";

// @States:
const sampleContent = `<h3>你好，ProseMirror</h3><p>这就是可编辑的文本，你可以将光标放入然后开始打字。</p><p>若要应用样式，你可以先选中一段文字，然后从菜单中进行相关操作。基本的 schema 支持 <em>斜体</em>，<strong>加粗</strong>，<a href="https://baidu.com">链接</a>，<code>代码字体</code> 等等 ...</p><h2>这是一个 H2 标题</h2><p>无序列表测试：</p><ul><li><p>今天天气好</p></li><li><p>吃肉🥩</p></li><li><p>🍲️火锅大王</p></li></ul><p>有序列表测试：</p><ol><li><p>很好啊</p></li><li><p>没问题</p></li></ol><blockquote><h2>Blockquote</h2><p>引用测试，这是一条别人说过的话 blablabla …&nbsp;</p></blockquote><p>插入一张图片：</p><p><img src="/assets/img/Icon-png-logo-raw.png" contenteditable="false" draggable="true"></p><p></p>`;
const options: BibEditorOptions = {
  initContent: sampleContent,
};
</script>

<style lang="less" scoped></style>
