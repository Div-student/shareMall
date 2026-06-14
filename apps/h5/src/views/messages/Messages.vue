<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { UserMessage } from '@sharemall/shared';
import { fetchMessages, markAllMessagesRead } from '@/api/message';

const router = useRouter();

const active = ref(0);
const loading = ref(true);
const messages = ref<UserMessage[]>([]);

const tabs = [
  { title: '全部', type: 'all' as const },
  { title: '订单', type: 'order' as const },
  { title: '交易', type: 'trade' as const },
  { title: '系统', type: 'system' as const },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchMessages({ type: tabs[active.value].type, page: 1, pageSize: 50 });
    messages.value = res.list;
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  void load();
}

function goDetail(msg: UserMessage) {
  router.push(`/messages/${msg.id}`);
}

async function onReadAll() {
  await markAllMessagesRead();
  await load();
}

onMounted(load);
onActivated(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="消息通知" left-arrow @click-left="router.back()">
      <template #right>
        <span class="read-all" @click="onReadAll">全部已读</span>
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="active" @change="onTabChange">
      <van-tab v-for="tab in tabs" :key="tab.type" :title="tab.title" />
    </van-tabs>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!messages.length" description="暂无消息" />

    <van-cell-group v-else inset>
      <van-cell
        v-for="msg in messages"
        :key="msg.id"
        :title="msg.title"
        :label="msg.content"
        is-link
        @click="goDetail(msg)"
      >
        <template #value>
          <van-badge v-if="!msg.isRead" dot />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<style scoped>
.read-all {
  font-size: 14px;
  color: #1989fa;
}
</style>
