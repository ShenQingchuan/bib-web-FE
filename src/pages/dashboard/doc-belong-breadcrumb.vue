<template>
  <a-breadcrumb class="doc-belong-breadcrumb-wrapper">
    <a-breadcrumb-item>
      <a class="doc-belong-breadcrumb-link" :href="`/user/${doc.creatorName}`">{{ doc.creatorName }}</a>
      <template
        v-if="doc.archiveType === DocListItemArchiveType.OrgOnly
        || doc.archiveType === DocListItemArchiveType.OrgWiki"
      >
        <a class="doc-belong-breadcrumb-link" :href="`/org/${doc.orgId}`">
          <span class="m-l-6">@</span>
          {{ doc.orgName }}
        </a>
      </template>
    </a-breadcrumb-item>
    <a-breadcrumb-item
      v-if="doc.archiveType == DocListItemArchiveType.UserWiki
      || doc.archiveType == DocListItemArchiveType.OrgWiki"
    >
      <a class="doc-belong-breadcrumb-link" :href="`/wiki/${doc.wikiId}`">{{ doc.wikiName }}</a>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { DocListItemArchiveType } from './common';
import type { DocListItem } from './common';

defineProps<{
  doc: DocListItem
}>();
</script>

<style lang="less" scoped="">
@import "../../less/color.less";

.doc-belong-breadcrumb-wrapper {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.doc-belong-breadcrumb-link {
  &,
  &:visited,
  &:link {
    color: @N500;
  }
  &:hover {
    color: @primary-color;
  }
}
</style>
