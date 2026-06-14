<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { HomeData, ProductListItem } from '@sharemall/shared';
import { fetchHome } from '@/api/product';

const router = useRouter();
const loading = ref(true);
const home = ref<HomeData | null>(null);
const products = ref<ProductListItem[]>([]);

onMounted(async () => {
  try {
    const data = await fetchHome();
    home.value = data;
    products.value = data.products;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <van-search placeholder="搜索商品" shape="round" readonly @click="router.push('/search')">
      <template #right-icon>
        <van-icon name="orders-o" style="margin-right: 12px" @click="router.push('/orders')" />
      </template>
    </van-search>

    <van-swipe v-if="home?.banners.length" :autoplay="3000" indicator-color="white" style="height: 160px">
      <van-swipe-item v-for="b in home.banners" :key="b.id">
        <img :src="b.image" class="banner-img" alt="banner" />
      </van-swipe-item>
    </van-swipe>
    <van-swipe v-else :autoplay="3000" indicator-color="white" style="height: 160px">
      <van-swipe-item>
        <div class="banner">轮播广告位</div>
      </van-swipe-item>
    </van-swipe>

    <van-grid v-if="home?.categories.length" :column-num="4" :border="false">
      <van-grid-item
        v-for="c in home.categories"
        :key="c.id"
        :icon="c.icon || 'apps-o'"
        :text="c.name"
        @click="router.push({ path: '/category', query: { id: c.id } })"
      />
    </van-grid>

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />
    <van-empty v-else-if="!products.length" description="暂无商品" />
    <div v-else class="product-flow">
      <div
        v-for="p in products"
        :key="p.id"
        class="product-card"
        @click="router.push(`/product/${p.id}`)"
      >
        <div class="product-cover">
          <img :src="p.mainImage" class="product-img" :alt="p.title" />
        </div>
        <div class="product-body">
          <div class="product-title">{{ p.title }}</div>
          <div class="product-price">
            <span class="symbol">¥</span>{{ p.price.toFixed(2) }}
          </div>
          <div class="product-fund">可获贡献金 {{ p.fundAmount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 12px;
}
.banner,
.banner-img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
}
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6034, #ee0a24);
  color: #fff;
  font-size: 18px;
}
.product-flow {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px 12px 0;
}
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.product-cover {
  width: 100%;
  aspect-ratio: 1;
  background: #f2f3f5;
}
.product-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-body {
  padding: 8px 10px 10px;
}
.product-title {
  font-size: 13px;
  line-height: 1.4;
  color: #323233;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 36px;
}
.product-price {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #ee0a24;
  line-height: 1.2;
}
.product-price .symbol {
  font-size: 12px;
}
.product-fund {
  margin-top: 4px;
  font-size: 11px;
  color: #ed6a0c;
}
</style>
