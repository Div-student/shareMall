<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { HomeData, ProductListItem } from '@sharemall/shared';
import { fetchHome } from '@/api/product';
import SmCategoryNav from '@/components/shop/SmCategoryNav.vue';
import SmLiveTicker from '@/components/shop/SmLiveTicker.vue';
import SmProductCard from '@/components/shop/SmProductCard.vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const loading = ref(true);
const home = ref<HomeData | null>(null);
const products = ref<ProductListItem[]>([]);
const bannerIndex = ref(0);
let bannerTimer: ReturnType<typeof setInterval> | null = null;

type ApiBannerSlide = { id: number; type: 'api'; image: string };
type DefaultBannerSlide = { id: number; type: 'default'; label: string; variant: number };
type BannerSlide = ApiBannerSlide | DefaultBannerSlide;

const DEFAULT_BANNERS: DefaultBannerSlide[] = [
  { id: 1, type: 'default', label: 'Banner 1 — 新品首发', variant: 1 },
  { id: 2, type: 'default', label: 'Banner 2 — 限时特惠', variant: 2 },
  { id: 3, type: 'default', label: 'Banner 3 — 品质甄选', variant: 3 },
];

const DEFAULT_TICKER = [
  '张* 刚刚下单了 智能蓝牙降噪耳机 Pro',
  '李** 刚刚下单了 进口有机坚果礼盒',
  '王* 刚刚下单了 轻奢陶瓷手表',
];

const MASKS = ['张*', '李**', '王*', '赵*', '陈**'];

const banners = computed((): BannerSlide[] => {
  if (home.value?.banners.length) {
    return home.value.banners.map((b) => ({ id: b.id, type: 'api' as const, image: b.image }));
  }
  return DEFAULT_BANNERS;
});

type DisplayProduct = {
  id: number;
  title: string;
  mainImage: string;
  price: number;
  fundAmount: number;
  sales: number;
  originalPrice?: number;
};

const DEMO_PRODUCTS: DisplayProduct[] = [
  { id: 0, title: '智能蓝牙降噪耳机 Pro', mainImage: '', price: 299, originalPrice: 399, fundAmount: 89.7, sales: 2300 },
  { id: 0, title: '轻奢陶瓷手表', mainImage: '', price: 899, originalPrice: 1299, fundAmount: 269.7, sales: 876 },
  { id: 0, title: '进口有机坚果礼盒', mainImage: '', price: 128, originalPrice: 168, fundAmount: 38.4, sales: 5100 },
  { id: 0, title: '纯棉四件套·云感系列', mainImage: '', price: 259, originalPrice: 359, fundAmount: 77.7, sales: 1600 },
  { id: 0, title: '钛钢情侣对戒', mainImage: '', price: 199, originalPrice: 299, fundAmount: 59.7, sales: 3400 },
  { id: 0, title: '大马士革玫瑰精油', mainImage: '', price: 168, originalPrice: 238, fundAmount: 50.4, sales: 1200 },
  { id: 0, title: '4K高清投影仪', mainImage: '', price: 1299, originalPrice: 1899, fundAmount: 389.7, sales: 432 },
  { id: 0, title: '儿童益智积木套装', mainImage: '', price: 89, originalPrice: 129, fundAmount: 26.7, sales: 7800 },
];

const displayProducts = computed((): DisplayProduct[] => {
  if (products.value.length) {
    return products.value.map((p) => ({ ...p, originalPrice: undefined }));
  }
  return DEMO_PRODUCTS;
});

const tickerMessages = computed(() => {
  if (!products.value.length) return DEFAULT_TICKER;
  return products.value.slice(0, 5).map((p, i) => `${MASKS[i % MASKS.length]} 刚刚下单了 ${p.title}`);
});

function goCart() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/cart' } });
    return;
  }
  router.push('/cart');
}

function goOrders() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/orders' } });
    return;
  }
  router.push('/orders');
}

function goProduct(id: number) {
  if (!id) return;
  router.push(`/product/${id}`);
}

function goCategory(id: number) {
  if (id === 10) {
    router.push('/category');
    return;
  }
  const apiCat = home.value?.categories[id - 1];
  if (apiCat) {
    router.push({ path: '/category', query: { id: apiCat.id } });
  } else {
    router.push('/category');
  }
}

function goBanner(idx: number) {
  bannerIndex.value = idx;
  resetBannerTimer();
}

function nextBanner() {
  bannerIndex.value = (bannerIndex.value + 1) % banners.value.length;
}

function resetBannerTimer() {
  if (bannerTimer) clearInterval(bannerTimer);
  bannerTimer = setInterval(nextBanner, 4000);
}

onMounted(async () => {
  resetBannerTimer();
  try {
    const data = await fetchHome();
    home.value = data;
    products.value = data.products;
    if (userStore.isLoggedIn) void cartStore.fetchCount();
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer);
});
</script>

<template>
  <div class="page-shop has-tabbar">
    <div class="page-scroll-area">
      <!-- 下拉刷新提示 -->
      <div class="pull-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        下拉刷新
      </div>

      <!-- 搜索栏 -->
      <div class="home-search">
        <div class="search-bar" role="button" tabindex="0" @click="router.push('/search')" @keyup.enter="router.push('/search')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span class="search-placeholder">搜索商品</span>
        </div>
        <button type="button" class="icon-btn" aria-label="订单" @click="goOrders">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h6" />
          </svg>
          <span class="badge-dot" />
        </button>
        <button type="button" class="icon-btn" aria-label="购物车" @click="goCart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>

      <!-- Banner 轮播 -->
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <div class="carousel-slides" :style="{ transform: `translateX(-${bannerIndex * 100}%)` }">
            <div
              v-for="b in banners"
              :key="b.id"
              class="carousel-slide"
              :class="b.type === 'default' ? `slide-variant-${b.variant}` : ''"
            >
              <img v-if="b.type === 'api'" :src="b.image" class="carousel-img" alt="banner" />
              <template v-else>{{ b.label }}</template>
            </div>
          </div>
        </div>
        <div class="carousel-dots-wrap">
          <button
            v-for="(_, idx) in banners"
            :key="idx"
            type="button"
            class="dot"
            :class="{ active: bannerIndex === idx }"
            :aria-label="`Slide ${idx + 1}`"
            @click="goBanner(idx)"
          />
        </div>
      </div>

      <!-- 金刚区 -->
      <SmCategoryNav variant="home" @select="goCategory" />

      <!-- 实时下单滚动 -->
      <SmLiveTicker :messages="tickerMessages" />

      <div class="section-gap" />

      <!-- 精选好物 -->
      <section>
        <div class="section-header">
          <h3>精选好物</h3>
          <button type="button" class="see-all" @click="router.push('/category')">
            查看更多
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <van-loading v-if="loading" class="home-loading" />
        <div v-else class="product-grid-2">
          <SmProductCard
            v-for="(p, idx) in displayProducts"
            :key="p.id ? p.id : `demo-${idx}`"
            :title="p.title"
            :image="p.mainImage"
            :price="p.price"
            :original-price="p.originalPrice"
            :fund-amount="p.fundAmount"
            :sales="p.sales"
            @click="goProduct(p.id)"
          />
        </div>
      </section>

      <div class="home-bottom-spacer" />
    </div>
  </div>
</template>

<style scoped>
.home-loading {
  display: block;
  padding: var(--space-6);
  text-align: center;
}

.home-bottom-spacer {
  height: var(--space-6);
}
</style>
