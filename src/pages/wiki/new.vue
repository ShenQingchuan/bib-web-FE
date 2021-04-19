<template>
  <common-header consice />
  <center-big-card-layout class="page-new-wiki__wrapper" title="新建知识库" description="创作、管理各种类型的知识">
    <template #center>
      <div class="page-new-wiki__form p-tb-32 p-l-10 p-r-32 flex-1">
        <!-- 知识库名称 -->
        <div class="page-new-wiki__form-item name flex-col m-b-32">
          <div class="page-new-wiki__form-label p-lr-2 m-b-6">
            <label for="wikiName">知识库名称</label>
          </div>
          <a-input name="wikiName" v-model:value="wikiName" placeholder="请输入知识库名称"></a-input>
        </div>

        <!-- 知识库描述 -->
        <div class="page-new-wiki__form-item desc flex-col m-b-32">
          <div class="page-new-wiki__form-label p-lr-2 m-b-6">
            <label for="wikiName">知识库简介</label>
          </div>
          <a-textarea name="wikiDesc" v-model:value="wikiDesc" placeholder="请输入知识库简介"></a-textarea>
        </div>

        <!-- 知识库可见范围 -->
        <div class="page-new-wiki__form-item scope flex-col m-b-32">
          <div class="page-new-wiki__form-label p-lr-2 m-b-6">
            <label>可见范围</label>
            <a-dropdown class="m-t-10">
              <div
                class="page-new-wiki__selected-scope-option flex-row anis-center p-lr-20 p-tb-12 cursor-ptr"
              >
                <span class="fw-700">{{ wikiScope.title }}</span>
                <span class="m-l-20 tc-n500 flex-1">{{ wikiScope.desc }}</span>
                <span class="jysf-end tc-primary">
                  <Down theme="outline" class="iconpark" size="20" />
                </span>
              </div>

              <template #overlay>
                <a-menu>
                  <a-menu-item key="private" @click="setScope('private')">
                    <div class="page-new-wiki__form-scope-option flex-row anis-center p-tb-12">
                      <Lock theme="filled" />
                      <div class="flex-col m-l-20">
                        <div
                          class="page-new-wiki__form-scope-option fw-700"
                        >{{ scopeOptions.private.title }}</div>
                        <div
                          class="page-new-wiki__form-scope-option tc-n500"
                        >{{ scopeOptions.private.desc }}</div>
                      </div>
                    </div>
                  </a-menu-item>
                  <a-menu-item key="public" @click="setScope('public')">
                    <div class="page-new-wiki__form-scope-option flex-row anis-center p-tb-12">
                      <Earth theme="outline" />
                      <div class="flex-col m-l-20">
                        <div
                          class="page-new-wiki__form-scope-option fw-700"
                        >{{ scopeOptions.public.title }}</div>
                        <div
                          class="page-new-wiki__form-scope-option tc-n500"
                        >{{ scopeOptions.public.desc }}</div>
                      </div>
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <a-button
          type="primary"
          block
          :disabled="!isFormValid"
          @click="onCreateWikiFormSubmit"
        >立 即 创 建</a-button>
      </div>

      <div class="page-new-wiki__illustration flex-col p-lr-20 m-l-32">
        <h3>将文档放入知识库</h3>
        <div class="tc-n500 m-b-32">
          进行结构化管理，在线完成知识创作。
          <br />
          <br />覆盖产品文档、项目文档、帮助手册、
          <br />周报、个人笔记、旅行攻略、财务报表、报价单等场景
        </div>
        <img class="m-t-32 m-lr-auto" src="/assets/svg/new-wiki_illustration.svg" alt="新建知识库" />
      </div>
    </template>
  </center-big-card-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, Earth, Down } from '@icon-park/vue-next';
import { fusions } from '@/fusions';
import { usePayloadFromToken } from '@/utils';
import { message } from 'ant-design-vue';
import CommonHeader from '@/components/view-header/common-header.vue'
import CenterBigCardLayout from '@/components/layouts/center-big-card-layout.vue';
import type { WikiSimpleDto } from '@/models';

enum ScopeType { private = 0, public = 1 };
type ScopeOption = { title: string; desc: string; type: ScopeType };

const tokenPayload = usePayloadFromToken()!;
const router = useRouter();

// @States:
const wikiName = ref('');
const wikiDesc = ref('');
const scopeOptions: Record<string, ScopeOption> = {
  private: {
    title: '仅自己可见',
    desc: '知识库仅自己和知识库所邀请协作者可见',
    type: ScopeType.private
  },
  public: {
    title: '互联网可见',
    desc: '知识库对互联网所有人可见',
    type: ScopeType.public
  }
};
const wikiScope = ref<ScopeOption>(scopeOptions.private);
const isFormValid = computed(() => wikiName.value.length > 0);

// @LifeCycels:

// @Methods:
const setScope = (scopeType: string) => {
  wikiScope.value = scopeOptions[scopeType];
};
const onCreateWikiFormSubmit = () => {
  const form = {
    userId: tokenPayload.userId,
    name: wikiName.value,
    desc: wikiDesc.value,
    scope: wikiScope.value.type
  };
  fusions.post('/wiki/', form).then(resp => {
    if (resp.data.responseOk) {
      const { id } = resp.data.data as WikiSimpleDto
      message.success('新建知识库成功！', 2);
      router.push(`/wiki/${id}`); // 跳转到新建完毕的知识库页面
    }
  })
}
</script>

<style lang="less" scoped>
@import "@/less/color.less";

.page-new-wiki__form {
  border-right: 1px solid @N200;
}
.page-new-wiki__illustration {
  width: 450px;
  img {
    width: 300px;
  }
}
.page-new-wiki__selected-scope-option {
  border: 1px solid @N300;
}
</style>
