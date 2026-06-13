<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;
const accruedFund = computed(() => route.query.accruedFund ?? '0');
</script>

<template>
  <div class="page">
    <van-nav-bar title="支付结果" />
    <van-empty image="success" :description="`支付成功，确认收货后可获贡献金 ${accruedFund}`" />
    <div style="padding: 0 16px; display: flex; gap: 12px">
      <van-button block plain @click="router.push(`/orders/${orderId}`)">查看订单</van-button>
      <van-button block type="primary" @click="router.push('/home')">继续购物</van-button>
    </div>
  </div>
</template>
