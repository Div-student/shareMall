<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ProductDetail } from '@sharemall/shared';
import { fetchProductDetail } from '@/api/product';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const product = ref<ProductDetail | null>(null);

const displayPrice = computed(() => {
  if (!product.value) return 0;
  return Math.round(product.value.price * 100);
});

onMounted(async () => {
  try {
    product.value = await fetchProductDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else-if="product">
      <van-swipe :autoplay="3000" style="height: 300px">
        <van-swipe-item v-for="(img, idx) in product.images" :key="idx">
          <img :src="img" class="img" alt="product" />
        </van-swipe-item>
      </van-swipe>
      <van-cell-group inset>
        <van-cell title="价格">
          <template #value>
            <span class="price">¥{{ product.price.toFixed(2) }}</span>
            <span v-if="product.marketPrice" class="market">¥{{ product.marketPrice.toFixed(2) }}</span>
          </template>
        </van-cell>
        <van-cell title="可获贡献金" :value="String(product.fundAmount)" />
        <van-cell title="配送" value="包邮" />
      </van-cell-group>
      <van-notice-bar scrollable text="实时下单动态：暂无数据" />
      <div class="detail" v-html="product.detailHtml" />

      <van-submit-bar :price="displayPrice" button-text="立即购买" @submit="router.push('/order/confirm')">
        <van-button icon="cart-o" type="warning" plain @click="router.push('/cart')" />
      </van-submit-bar>
    </template>
    <van-empty v-else description="商品不存在" />
  </div>
</template>

<style scoped>
.img {
  display: block;
  width: 100%;
  height: 300px;
  object-fit: cover;
}
.price {
  color: #ee0a24;
  font-weight: 600;
  font-size: 16px;
}
.market {
  margin-left: 8px;
  color: #969799;
  font-size: 12px;
  text-decoration: line-through;
}
.detail {
  padding: 16px;
  background: #fff;
  margin-bottom: 60px;
  line-height: 1.6;
}
</style>
