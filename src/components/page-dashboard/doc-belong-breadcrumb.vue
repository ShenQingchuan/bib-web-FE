<template>
  <a-breadcrumb class="doc-belong-breadcrumb-wrapper" separator="-">
    <a-breadcrumb-item v-if="doc.creatorId !== credential.userId">
      <a class="doc-belong-breadcrumb-link" :href="`/user/${doc.creatorName}`">
        <span class="m-l-6">
          <User class="iconpark m-r-4" />
          {{ doc.creatorName }}
        </span>
      </a>
    </a-breadcrumb-item>
    <a-breadcrumb-item
      v-if="doc.archiveType === DocListItemArchiveType.OrgWiki"
    >
      <a class="doc-belong-breadcrumb-link" :href="`/org/${doc.orgId}`">
        <span class="m-l-6">@ {{ doc.orgName }}</span>
      </a>
    </a-breadcrumb-item>
    <a-breadcrumb-item
      v-if="
        doc.archiveType == DocListItemArchiveType.UserWiki ||
          doc.archiveType == DocListItemArchiveType.OrgWiki
      "
    >
      <a class="doc-belong-breadcrumb-link" :href="`/wiki/${doc.wikiId}`">
        <FolderOpen class="iconpark m-r-2" />
        {{ doc.wikiName }}
      </a>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { FolderOpen, User } from '@icon-park/vue-next';
import { DocListItemArchiveType } from './common';
import type { DocListItem } from './common';
import { usePayloadFromToken } from "@/utils";

defineProps<{
  doc: DocListItem
}>();

const credential = usePayloadFromToken()!;
</script>

<style lang="less" scoped="">
@import '../../less/color.less';

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
