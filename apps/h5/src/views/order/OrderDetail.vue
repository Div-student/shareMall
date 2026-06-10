<script setup lang="ts"></script>

<template>
  <div class="page">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" />
    <van-cell-group inset>
      <van-cell title="订单状态" value="-" />
      <van-cell title="贡献金抵扣" value="-¥0.00" />
      <van-cell title="本单累计贡献金" value="0" />
    </van-cell-group>
    <div class="placeholder">订单详情（接入接口后展示）</div>
  </div>
</template>
