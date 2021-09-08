@<template>
  <a-comment>
    <template #actions>
      <span>
        <a-tooltip :title="liked ? '点赞' : '取消点赞'">
          <LikeFilled v-if="liked" @click="handleHitLike" />
          <LikeOutlined v-else @click="handleHitLike" />
        </a-tooltip>
        <span class="p-l-8">{{ likedCount }}</span>
      </span>
      <div
        class="page-document-view__comment-reply-to inline cursor-ptr"
        @click="handleReply"
      >
        回复
      </div>
    </template>
    <template #author>
      <a :href="`/user/${comment.creator.userName}`">{{
        comment.creator.userName
      }}</a>
    </template>
    <template #avatar>
      <a-avatar
        :src="userAvatarUrlFix(comment.creator.userDetails.avatarURL)"
        alt="comment-user-avatar"
      />
    </template>
    <template #content>
      <p>
        <a
          v-if="comment.replyTo"
          :href="`/user/${comment.replyTo.creator.userName}`"
          >@{{ comment.replyTo.creator.userName }}</a
        >
        {{ comment.content }}
      </p>
    </template>
    <template #datetime>
      <a-tooltip :title="displayTimeWithFormat()">
        <span>{{ displayTimeFromNow() }}</span>
      </a-tooltip>
    </template>
  </a-comment>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { LikeFilled, LikeOutlined } from '@ant-design/icons-vue';
import { useDayjs } from "@/composable/useDayjs";
import { userAvatarUrlFix } from '@/utils';
import type { DocumentCommentDto } from "@/models";

const props = defineProps<{
  comment: DocumentCommentDto;
}>();

const emit = defineEmits(['replyTo']);

// @States:
const liked = ref(false);
const likedCount = computed(() => {
  let count = props.comment.thumbsUpCount;
  return liked.value ? count + 1 : count;
})

// @Methods:
const displayTimeWithFormat = () => useDayjs(props.comment.createTime).format('YYYY-MM-DD HH:mm:ss');
const displayTimeFromNow = () => useDayjs(props.comment.createTime).fromNow();
const handleHitLike = () => {
  liked.value = !liked.value;

  // TODO: 发送点赞请求 - 防抖 immediate
}
const handleReply = () => emit('replyTo', props.comment);
</script>

<style lang="less" scoped>
@import '@/less/color.less';
@import '@/less/shared.less';

.page-document-view__comment-reply-to {
  color: @N500;

  .hover-in-primary-color;
}
.page-document-view__comment-reply-to {
  .hover-in-primary-color;
}
</style>
