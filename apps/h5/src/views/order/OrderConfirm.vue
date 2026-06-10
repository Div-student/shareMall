<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const useFund = ref(false);
</script>

<template>
  <div class="page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" />
    <van-cell title="收货地址" is-link value="请选择收货地址" @click="router.push('/mine/address')" />
    <van-cell-group inset>
      <van-cell title="商品总额" value="¥0.00" />
      <van-cell title="使用可用贡献金抵扣">
        <template #value>
          <van-switch v-model="useFund" size="20px" />
        </template>
      </van-cell>
      <van-cell title="贡献金抵扣" value="-¥0.00" />
      <van-cell title="运费" value="¥0.00" />
      <van-cell title="预计可获贡献金" value="0" />
    </van-cell-group>
    <van-submit-bar :price="0" button-text="提交订单" @submit="router.push('/order/pay/1')" />
  </div>
</template>
