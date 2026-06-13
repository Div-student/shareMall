<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAftersaleList, type AftersaleItem } from '@/api/aftersale';

const router = useRouter();
const loading = ref(true);
const active = ref(0);
const records = ref<AftersaleItem[]>([]);

const tabs = [
  { title: '全部', status: 'all' },
  { title: '待审核', status: 'pending' },
  { title: '已退款', status: 'refunded' },
  { title: '已驳回', status: 'rejected' },
];

function formatTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/mine');
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchAftersaleList({ status: tabs[active.value].status, page: 1, pageSize: 50 });
    records.value = res.list;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="售后记录" left-arrow @click-left="goBack" />

    <van-tabs v-model:active="active" @change="load">
      <van-tab v-for="tab in tabs" :key="tab.status" :title="tab.title" />
    </van-tabs>

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />
    <van-empty v-else-if="!records.length" description="暂无售后记录" />

    <van-cell-group v-else inset style="margin-top: 12px">
      <van-cell
        v-for="item in records"
        :key="item.id"
        :title="`${item.orderNo} · ${item.typeLabel}`"
        :label="`${formatTime(item.createdAt)} · 退款 ¥${item.refundAmount}`"
        :value="item.statusLabel"
        is-link
        @click="router.push(`/aftersale/${item.id}`)"
      />
    </van-cell-group>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
