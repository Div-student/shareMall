<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showLoadingToast, closeToast } from 'vant';
import { fetchOrderDetail, payOrder } from '@/api/order';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;
const payAmount = ref(0);
const loading = ref(true);
const paying = ref(false);

async function loadOrder() {
  try {
    const order = await fetchOrderDetail(orderId);
    payAmount.value = order.payAmount;
  } finally {
    loading.value = false;
  }
}

async function doPay(channel: 'wechat' | 'alipay') {
  paying.value = true;
  const toast = showLoadingToast({ message: '支付中...', forbidClick: true });
  try {
    const result = await payOrder(orderId, channel);
    router.replace({
      path: `/order/result/${orderId}`,
      query: { accruedFund: String(result.accruedFund) },
    });
  } finally {
    closeToast();
    paying.value = false;
  }
}

onMounted(loadOrder);
</script>

<template>
  <div class="page">
    <van-nav-bar title="收银台" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <van-cell-group v-else inset>
      <van-cell title="待支付金额" :value="`¥${payAmount.toFixed(2)}`" />
      <van-cell title="微信支付" is-link :disabled="paying" @click="doPay('wechat')" />
      <van-cell title="支付宝" is-link :disabled="paying" @click="doPay('alipay')" />
    </van-cell-group>
    <div class="tip">开发环境 Mock 支付，点击即视为支付成功</div>
  </div>
</template>

<style scoped>
.tip {
  padding: 16px;
  color: #969799;
  font-size: 12px;
  text-align: center;
}
</style>
