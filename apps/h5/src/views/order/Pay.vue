<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId;
</script>

<template>
  <div class="page">
    <van-nav-bar title="收银台" />
    <van-cell-group inset>
      <van-cell title="待支付金额" value="¥0.00" />
      <van-cell title="微信支付" clickable @click="router.push(`/order/result/${orderId}`)" />
      <van-cell title="支付宝" clickable @click="router.push(`/order/result/${orderId}`)" />
    </van-cell-group>
  </div>
</template>
