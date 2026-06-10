<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="page">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />
    <van-swipe :autoplay="3000" style="height: 300px">
      <van-swipe-item>
        <div class="img">商品图片轮播</div>
      </van-swipe-item>
    </van-swipe>
    <van-cell-group inset>
      <van-cell title="价格" value="¥0.00" />
      <van-cell title="可获贡献金" value="0" />
      <van-cell title="配送" value="包邮" />
    </van-cell-group>
    <van-notice-bar scrollable text="实时下单动态：xxx 用户刚刚下单了本商品 ..." />
    <div class="placeholder">商品详情图文（接入接口后展示）</div>

    <van-submit-bar :price="0" button-text="立即购买" @submit="router.push('/order/confirm')">
      <van-button icon="cart-o" type="warning" plain @click="router.push('/cart')" />
    </van-submit-bar>
  </div>
</template>

<style scoped>
.img {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: #f2f3f5;
  color: #969799;
}
</style>
