<script setup lang="ts">
import { ref } from 'vue';

const active = ref(0);
const tabs = ['全部', '待付款', '待发货', '待收货', '已完成', '售后'];
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="active">
      <van-tab v-for="t in tabs" :key="t" :title="t" />
    </van-tabs>
    <van-empty description="暂无订单" />
  </div>
</template>
