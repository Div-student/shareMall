<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAftersaleDetail, type AftersaleItem } from '@/api/aftersale';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const detail = ref<AftersaleItem | null>(null);

function formatTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function goBack() {
  router.back();
}

onMounted(async () => {
  loading.value = true;
  try {
    detail.value = await fetchAftersaleDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="售后详情" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />

    <van-cell-group v-else-if="detail" inset>
      <van-cell title="状态" :value="detail.statusLabel" />
      <van-cell title="订单号" :value="detail.orderNo" />
      <van-cell title="售后类型" :value="detail.typeLabel" />
      <van-cell title="退款金额" :value="`¥${detail.refundAmount}`" />
      <van-cell title="回退抵扣" :value="`¥${detail.fundRollback}`" />
      <van-cell title="冲销累计" :value="`¥${detail.fundVoid}`" />
      <van-cell title="申请原因" :label="detail.reason" />
      <van-cell title="申请时间" :value="formatTime(detail.createdAt)" />
    </van-cell-group>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
