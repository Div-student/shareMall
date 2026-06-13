<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithdrawRecords, type WithdrawRecord } from '@/api/withdraw';

const router = useRouter();
const loading = ref(true);
const active = ref(0);
const records = ref<WithdrawRecord[]>([]);

const tabs = [
  { title: '全部', status: 'all' },
  { title: '处理中', status: 'pending' },
  { title: '已到账', status: 'paid' },
  { title: '已驳回', status: 'rejected' },
];

const statusMap: Record<string, string> = {
  pending: '待审核',
  auditing: '审核中',
  approved: '已通过',
  paying: '打款中',
  paid: '已到账',
  rejected: '已驳回',
  failed: '失败',
};

function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/withdraw');
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchWithdrawRecords({ status: tabs[active.value].status, page: 1, pageSize: 50 });
    records.value = res.list;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="提现记录" left-arrow @click-left="goBack" />

    <van-tabs v-model:active="active" @change="load">
      <van-tab v-for="tab in tabs" :key="tab.status" :title="tab.title" />
    </van-tabs>

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />
    <van-empty v-else-if="!records.length" description="暂无提现记录" />

    <van-cell-group v-else inset style="margin-top: 12px">
      <van-cell
        v-for="item in records"
        :key="item.id"
        :title="`${item.methodLabel} 提现 ¥${item.amount}`"
        :label="`${formatTime(item.createdAt)}${item.rejectReason ? ' · ' + item.rejectReason : ''}`"
        :value="statusMap[item.status] ?? item.status"
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
