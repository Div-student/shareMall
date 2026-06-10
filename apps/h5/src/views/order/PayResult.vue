<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="page">
    <van-nav-bar title="支付结果" />
    <van-empty image="success" description="支付成功" />
    <div style="padding: 0 16px; display: flex; gap: 12px">
      <van-button block plain @click="router.push('/orders')">查看订单</van-button>
      <van-button block type="primary" @click="router.push('/home')">继续购物</van-button>
    </div>
  </div>
</template>
