<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="page">
    <van-nav-bar title="购物车" />
    <van-empty description="购物车为空" />
    <van-submit-bar :price="0" button-text="去结算" @submit="router.push('/order/confirm')" />
  </div>
</template>
