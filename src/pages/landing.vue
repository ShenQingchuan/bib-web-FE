<template>
  <div class="page-landing__wrapper flex-col anis-center">
    <div class="page-landing__header flex-row anis-center p-lr-48">
      <img
        class="page-landing-header__logo"
        src="/assets/img/Icon-png-logo.png"
        alt="logo"
      />

      <a
        href="/login"
        class="page-landing__ant-btn ant-btn m-l-auto m-r-12 fs-16"
        ><span>登录</span></a
      >
      <a
        href="/register"
        class="page-landing__ant-btn ant-btn ant-btn-primary m-lr-12 fs-16"
        ><span>快速注册</span></a
      >
    </div>

    <section class="p-tb-32 p-lr-24 flex-row m-t-200">
      <div class="m-r-64">
        <div class="fw-700 fs-42">开源的在线协同知识库</div>
        <div class="fs-24 fw-300">个人笔记与知识创作，团队协同与知识沉淀</div>
        <a
          href="/login"
          class="page-landing__ant-btn ant-btn ant-btn-primary m-t-48 fs-18 p-lr-24 p-b-6"
          ><span>开始使用</span></a
        >
      </div>
      <img
        class="page-landing-title__illustration flex-1"
        src="/assets/img/landing-title-background.png"
        alt="首页标题配图"
      />
    </section>

    <a-divider class="w-600px m-lr-auto" />

    <section class="p-t-12 p-b-32 p-lr-24 flex-col anis-center m-t-64">
      <div class="text-center p-4 fw-500 fs-32">常用场景</div>
      <div class="flex-row anis-center m-tb-32">
        <div
          v-for="condition in conditions"
          :key="condition.title"
          class="flex-col anis-center m-lr-32"
        >
          <img
            class="page-landing__condition-pic"
            :src="condition.imgSrc"
            alt="个人笔记"
          />
          <div class="m-t-24 fw-500 fs-24">{{ condition.title }}</div>
          <div class="m-t-10 fs-18 tc-n500">{{ condition.desc }}</div>
        </div>
      </div>
    </section>

    <a-divider class="w-600px m-lr-auto" />

    <section class="p-t-12 p-b-32 p-lr-24 flex-col anis-center m-t-64">
      <div class="text-center p-4 fw-500 fs-32">核心特色</div>
      <div class="flex-row anis-center">
        <div class="flex-col m-tb-32">
          <div
            v-for="(spec, index) in specs"
            :key="spec.title"
            class="page-landing__spec-card flex-col m-tb-32 p-tb-32 p-lr-24 m-tb-8 m-tb-16 cursor-ptr"
            :class="{
              active: specKey === index
            }"
            @click="specKey = index"
          >
            <div class="flex-col">
              <div class="fw-500 fs-20">{{ spec.title }}</div>
              <div class="m-t-16 fs-16">{{ spec.desc }}</div>
            </div>
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <img
            v-if="specKey === 0"
            class="page-landing__spec-img m-l-64"
            :src="specs[0].imgSrc"
            alt="核心特色"
          />
          <img
            v-else-if="specKey === 1"
            class="page-landing__spec-img m-l-64"
            :src="specs[1].imgSrc"
            alt="核心特色"
          />
          <img
            v-else-if="specKey === 2"
            class="page-landing__spec-img m-l-64"
            :src="specs[2].imgSrc"
            alt="核心特色"
          />
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const conditions = [
  {
    title: '个人笔记',
    desc: '记录点滴，沉淀知识',
    imgSrc: '/assets/img/landing-note-pic.png'
  },
  {
    title: '博客文章',
    desc: '输出观点，分享交流',
    imgSrc: '/assets/img/landing-blog-pic.png'
  },
  {
    title: '项目文档',
    desc: '多人协同，高效工作',
    imgSrc: '/assets/img/landing-project-doc-pic.png'
  },
  {
    title: '官方文档',
    desc: '产品说明，帮助手册',
    imgSrc: '/assets/img/landing-official-doc-pic.png'
  }
];
const specs = [
  {
    title: '像书一样的知识库',
    desc:
      'Bib 提供的知识库管理功能，能够有效帮助用户整理零碎文档，结构清晰，可以很方便地沉淀创作内容。',
    imgSrc: '/assets/img/landing-spec-wiki.png'
  },
  {
    title: '专业好用的编辑器',
    desc:
      'Bib 自研编辑器，支持多种文字格式，具备基础 Markdown 功能，可插入代码块、MathJax 公式、本地或在线图片以及外链多媒体，可满足多种需求，让创作更高效。',
    imgSrc: '/assets/img/landing-spec-editor.png'
  },
  {
    title: '安静愉悦的在线协同',
    desc:
      '语雀提倡理性不打扰的异步高效协同，可以享受安安静静的专注工作。需要沟通协同时，轻轻一点分享就可通知对方。在语雀，一切安静有序，心流在愉悦中发生。',
    imgSrc: '/assets/img/landing-spec-collaboration.png'
  }
];

// @States:
const specKey = ref(0);

// @LifeCycels:
setInterval(() => {
  if (specKey.value === 2) {
    specKey.value = 0;
  } else {
    specKey.value += 1;
  }
}, 3000);

// @Methods:
</script>

<style lang="less" scoped>
@import '@/less/color.less';
@import '@/less/shared.less';

.page-landing__header {
  .header-container;
}
.page-landing__wrapper {
  background-color: @N20;
  min-height: 100vh;
}
.page-landing-header__logo {
  width: 100px;
  height: auto;
}
.page-landing-title__illustration {
  width: 600px;
}
.page-landing__ant-btn {
  height: auto;
  border-radius: 6px;
  padding: 4px 15px !important;
}
.page-landing__condition-pic {
  width: 90px;
}
.page-landing__spec-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  width: 500px;
  box-shadow: 0 2px 8px -2px rgb(5 8 82 / 12%);
  transition: padding 0.1s linear, margin-left 0.1s linear,
    margin-right 0.1s linear;
  &.active {
    padding-left: 30px;
    border-left: 4px solid @primary-color;
  }
}
.page-landing__spec-img {
  width: 600px;
  height: 360px;
}
</style>
