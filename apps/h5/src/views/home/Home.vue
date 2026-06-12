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
      />
    </van-grid>

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />
    <van-empty v-else-if="!products.length" description="暂无商品" />
    <van-card
      v-for="p in products"
      v-else
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
</style>
