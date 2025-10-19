<script setup lang="ts">


export interface CommentNode {
  id: number
  poemId: number
  author: string
  content: string
  likes: number
  time: string
  parentId?: number | null
  children?: CommentNode[]
}

const props = defineProps<{ node: CommentNode }>()
const emit = defineEmits<{ (e: 'reply', node: CommentNode): void }>()
const onReply = () => emit('reply', props.node)
</script>

<template>
  <li class="comment-item">
    <div class="comment-head">
      <div class="comment-avatar">人</div>
      <div>
        <strong>{{ node.author }}</strong>
        <div class="muted">{{ node.time }}</div>
      </div>
    </div>
    <p class="content">{{ node.content }}</p>
    <div class="comment-actions">
      <span class="muted">👍 {{ node.likes }}</span>
      <button class="link" @click="onReply">回复</button>
    </div>
    <ul v-if="node.children && node.children.length" class="children">
      <CommentItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @reply="$emit('reply', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.children { list-style: none; padding-left: 16px; margin-top: 8px; border-left: 2px dashed var(--border); }
.link { background: transparent; border: none; color: var(--brand); cursor: pointer; padding: 0; }
</style>