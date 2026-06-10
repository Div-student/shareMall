<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ProductListItem } from '@sharemall/shared';

const router = useRouter();
const products = ref<ProductListItem[]>([]);

onMounted(() => {
  // TODO: 调用 /api/home 与 /api/products 获取真实数据
  products.value = [];
});
</script>

<template>
  <div class="page">
    <van-search placeholder="搜索商品" shape="round" readonly @click="router.push('/search')">
      <template #right-icon>
        <van-icon name="orders-o" style="margin-right: 12px" @click="router.push('/orders')" />
      </template>
    </van-search>

    <van-swipe :autoplay="3000" indicator-color="white" style="height: 160px">
      <van-swipe-item>
        <div class="banner">轮播广告位</div>
      </van-swipe-item>
    </van-swipe>

    <van-grid :column-num="4" :border="false">
      <van-grid-item v-for="i in 8" :key="i" icon="apps-o" :text="`分类${i}`" />
    </van-grid>

    <van-empty v-if="!products.length" description="商品列表（接入接口后展示）" />
    <van-card
      v-for="p in products"
      :key="p.id"
      :price="p.price.toFixed(2)"
      :title="p.title"
      :thumb="p.mainImage"
      :desc="`可获贡献金 ${p.fundAmount}`"
      @click="router.push(`/product/${p.id}`)"
    />
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  background: linear-gradient(135deg, #ff6034, #ee0a24);
  color: #fff;
  font-size: 18px;
}
</style>
