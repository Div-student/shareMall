<script setup lang="ts"></script>

<template>
  <div class="page">
    <van-nav-bar title="收货地址" left-arrow @click-left="$router.back()" />
    <van-empty description="暂无收货地址" />
    <div style="padding: 16px">
      <van-button block type="primary">新增收货地址</van-button>
    </div>
  </div>
</template>
