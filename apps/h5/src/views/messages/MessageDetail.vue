<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { UserMessage } from '@sharemall/shared';
import { fetchMessageDetail } from '@/api/message';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const message = ref<UserMessage | null>(null);

function formatTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    message.value = await fetchMessageDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
}

function onLink() {
  if (!message.value?.link) return;
  router.push(message.value.link);
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="消息详情" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="message">
      <van-cell-group inset>
        <van-cell title="标题" :value="message.title" />
        <van-cell title="时间" :value="formatTime(message.createdAt)" />
        <van-cell title="内容" :label="message.content" />
      </van-cell-group>

      <div v-if="message.link" class="footer">
        <van-button block type="primary" @click="onLink">查看详情</van-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.footer {
  padding: 16px;
}
</style>
