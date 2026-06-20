<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { ProductDetail, ProductReviewItem } from '@sharemall/shared';
import { addToCart } from '@/api/cart';
import { fetchProductDetail, fetchProductOrderFeed } from '@/api/product';
import { fetchProductReviews } from '@/api/review';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmSkuSheet from '@/components/shop/SmSkuSheet.vue';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const loading = ref(true);
const product = ref<ProductDetail | null>(null);
const reviews = ref<ProductReviewItem[]>([]);
const selectedSkuId = ref<number | null>(null);
const carouselIndex = ref(0);
const showSkuSheet = ref(false);
const skuMode = ref<'cart' | 'buy'>('cart');
const touchStartX = ref(0);
const tickerText = ref('');
const tickerVisible = ref(true);
let tickerTimer: ReturnType<typeof setInterval> | null = null;
let tickerIdx = 0;

const DEFAULT_SPECS = [
  { label: '产地', value: '深圳' },
  { label: '重量', value: '280g' },
  { label: '连接', value: '蓝牙5.3' },
  { label: '续航', value: '36小时' },
  { label: '降噪深度', value: '-42dB' },
];

const DEFAULT_REVIEW_TAGS = [
  { label: '降噪出色', count: 238 },
  { label: '音质清晰', count: 192 },
  { label: '佩戴舒适', count: 156 },
];

const MASKS = ['张*', '李*', '王*', '陈*', '赵*'];
const TIME_AGO = ['3分钟前', '5分钟前', '8分钟前', '12分钟前', '15分钟前'];

const carouselImages = computed(() => {
  if (!product.value) return [] as string[];
  const { mainImage, images } = product.value;
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const url of [mainImage, ...(images ?? [])]) {
    if (url && !seen.has(url)) {
      seen.add(url);
      merged.push(url);
    }
  }
  return merged;
});

const currentSku = computed(() => {
  if (!product.value) return null;
  const id = selectedSkuId.value ?? product.value.skus[0]?.id;
  return product.value.skus.find((s) => s.id === id) ?? null;
});

const displayPrice = computed(() => currentSku.value?.price ?? product.value?.price ?? 0);
const fundAmount = computed(() => product.value?.fundAmount ?? 0);
const fundRatioPercent = computed(() => {
  const ratio = product.value?.fundRatio ?? 0;
  return Math.round(ratio * 100);
});

const specLabel = computed(() => {
  if (!currentSku.value) return '请选择 颜色分类、规格';
  const values = Object.values(currentSku.value.spec);
  return values.length ? values.join('，') : '请选择 颜色分类、规格';
});

const cartBadge = computed(() => {
  const n = cartStore.count;
  if (n <= 0) return '';
  return n > 99 ? '99+' : String(n);
});

const tickerMessages = computed(() => {
  const title = product.value?.title ?? '该商品';
  return MASKS.map((mask, i) => `${mask} 刚刚下单了 ${title} · ${TIME_AGO[i]}`);
});

const reviewStats = computed(() => {
  if (reviews.value.length) {
    const avg = reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length;
    const good = reviews.value.filter((r) => r.rating >= 4).length;
    return {
      score: avg.toFixed(1),
      goodRate: Math.round((good / reviews.value.length) * 100),
    };
  }
  return { score: '4.8', goodRate: 96 };
});

const reviewTags = computed(() => {
  if (reviews.value.length >= 3) {
    return reviews.value.slice(0, 3).map((r, i) => ({
      label: r.content.slice(0, 6) || `评价${i + 1}`,
      count: Math.max(1, reviews.value.length - i * 40),
    }));
  }
  return DEFAULT_REVIEW_TAGS;
});

const hasDetailHtml = computed(() => {
  const html = product.value?.detailHtml?.trim() ?? '';
  return html.length > 0 && html !== '<p></p>';
});

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function formatSales(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.floor(k)}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

function goToSlide(index: number) {
  const total = carouselImages.value.length;
  if (!total) return;
  carouselIndex.value = ((index % total) + total) % total;
}

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
}

function onTouchEnd(e: TouchEvent) {
  const diff = touchStartX.value - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToSlide(carouselIndex.value + 1);
    else goToSlide(carouselIndex.value - 1);
  }
}

function startTicker() {
  stopTicker();
  const msgs = tickerMessages.value;
  if (!msgs.length) return;
  tickerText.value = msgs[0];
  tickerIdx = 1;
  tickerTimer = setInterval(() => {
    tickerVisible.value = false;
    setTimeout(() => {
      tickerText.value = msgs[tickerIdx % msgs.length];
      tickerIdx += 1;
      tickerVisible.value = true;
    }, 300);
  }, 4000);
}

function stopTicker() {
  if (tickerTimer) {
    clearInterval(tickerTimer);
    tickerTimer = null;
  }
}

function openSku(mode: 'cart' | 'buy') {
  skuMode.value = mode;
  showSkuSheet.value = true;
}

async function onSkuConfirm(payload: { skuId: number; quantity: number }) {
  if (!product.value) return;
  selectedSkuId.value = payload.skuId;
  showSkuSheet.value = false;
  if (skuMode.value === 'cart') {
    await addToCart({ productId: product.value.id, skuId: payload.skuId, quantity: payload.quantity });
    await cartStore.fetchCount();
    showToast('已加入购物车');
    return;
  }
  const sku = product.value.skus.find((s) => s.id === payload.skuId);
  sessionStorage.setItem(
    'checkoutItems',
    JSON.stringify([
      {
        skuId: payload.skuId,
        quantity: payload.quantity,
        title: product.value.title,
        mainImage: sku?.skuImage ?? product.value.mainImage,
        price: sku?.price ?? product.value.price,
      },
    ]),
  );
  router.push('/order/confirm');
}

function goCart() {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/cart' } });
    return;
  }
  router.push('/cart');
}

function goSupport() {
  router.push('/support');
}

async function loadProduct(id: string) {
  loading.value = true;
  carouselIndex.value = 0;
  try {
    const [detail, feed, reviewPage] = await Promise.all([
      fetchProductDetail(id),
      fetchProductOrderFeed(id).catch(() => ({ list: [] })),
      fetchProductReviews(id, { page: 1, pageSize: 10 }).catch(() => ({ list: [], total: 0 })),
    ]);
    product.value = detail;
    reviews.value = reviewPage.list;
    if (detail.skus.length) selectedSkuId.value = detail.skus[0].id;
    if (feed.list.length) tickerText.value = feed.list[0].text;
    startTicker();
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) void loadProduct(id as string);
  },
);

watch(carouselImages, (imgs) => {
  if (carouselIndex.value >= imgs.length) carouselIndex.value = 0;
});

watch(tickerMessages, startTicker);

watch(showSkuSheet, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onMounted(() => {
  const id = route.params.id as string;
  if (id) void loadProduct(id);
  if (userStore.isLoggedIn) void cartStore.fetchCount();
});

onUnmounted(() => {
  stopTicker();
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="page-shop product-detail-page">
    <SmAppHeader fixed title="商品详情" @back="router.back()">
      <template #actions>
        <button type="button" class="back-btn" aria-label="分享" @click="showToast('分享功能开发中')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </template>
    </SmAppHeader>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else-if="product">
      <main class="page-body with-action-bar">
        <!-- 主图轮播 -->
        <section
          class="product-carousel"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="carousel-track">
            <div
              class="carousel-slides"
              :style="{ transform: `translateX(-${carouselIndex * 100}%)` }"
            >
              <div v-for="(img, idx) in carouselImages" :key="img || idx" class="carousel-slide">
                <img v-if="img" :src="img" :alt="product.title" />
                <div v-else class="ph-img square">产品图 {{ idx + 1 }}/{{ carouselImages.length }}</div>
              </div>
              <div v-if="!carouselImages.length" class="carousel-slide">
                <div class="ph-img square">产品图</div>
              </div>
            </div>
          </div>
          <div v-if="carouselImages.length > 1" class="carousel-indicators">
            <button
              v-for="(_, idx) in carouselImages"
              :key="idx"
              type="button"
              class="dot"
              :class="{ active: carouselIndex === idx }"
              :aria-label="`图片 ${idx + 1}`"
              @click="goToSlide(idx)"
            />
          </div>
        </section>

        <!-- 缩略图 -->
        <div v-if="carouselImages.length > 1" class="thumbnail-strip">
          <button
            v-for="(img, idx) in carouselImages"
            :key="idx"
            type="button"
            class="thumb"
            :class="{ active: carouselIndex === idx }"
            @click="goToSlide(idx)"
          >
            <img v-if="img" :src="img" alt="" />
            <div v-else class="ph-img">{{ idx + 1 }}</div>
          </button>
        </div>

        <!-- 价格区 -->
        <section class="price-section">
          <div>
            <span class="main-price"><span class="yuan-symbol">¥</span>{{ formatPrice(displayPrice) }}</span>
            <span v-if="product.marketPrice" class="original-price">¥{{ formatPrice(product.marketPrice) }}</span>
          </div>
          <div class="contrib-badge-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            可获贡献金¥{{ formatPrice(fundAmount) }}
          </div>
          <div class="contrib-note">确认收货后到账</div>
        </section>

        <!-- 商品信息 -->
        <section class="product-info-section">
          <h1>{{ product.title }}</h1>
          <div class="sales-row">
            <span>已售{{ formatSales(product.sales) }}</span>
            <span class="star-rating">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              {{ reviewStats.score }}
            </span>
          </div>
        </section>

        <!-- 贡献金说明 -->
        <section class="contrib-panel">
          <div class="contrib-panel-title">贡献金说明</div>
          <p>购买可获待兑现贡献金¥{{ formatPrice(fundAmount) }}</p>
          <p>确认收货后按成交价{{ fundRatioPercent }}%计入待兑现贡献金</p>
          <p>累计达档位可打卡兑现</p>
        </section>

        <!-- 下单动态 -->
        <div class="live-ticker detail-ticker">
          <div class="ticker-content">
            <span class="ticker-dot" />
            <span class="ticker-text-fade" :style="{ opacity: tickerVisible ? 1 : 0 }">{{ tickerText }}</span>
          </div>
        </div>

        <!-- 规格选择 -->
        <button type="button" class="sku-trigger" @click="openSku('cart')">
          <span class="sku-label">选择规格</span>
          <span class="sku-value">
            <span>{{ specLabel }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </button>

        <!-- 产品参数 -->
        <section class="specs-table">
          <div class="section-title">产品参数</div>
          <table>
            <tbody>
              <tr v-for="row in DEFAULT_SPECS" :key="row.label">
                <td>{{ row.label }}</td>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 商品详情 -->
        <section class="detail-section">
          <div class="section-title">商品详情</div>
          <div v-if="hasDetailHtml" class="detail-html-body" v-html="product.detailHtml" />
          <div v-else class="detail-placeholder ph-img">
            <span>图文详情区域</span>
          </div>
        </section>

        <!-- 用户评价 -->
        <section class="review-section">
          <div class="section-title">用户评价</div>
          <div class="review-summary">
            <span class="review-score">{{ reviewStats.score }}分</span>
            <span class="review-rate">好评率{{ reviewStats.goodRate }}%</span>
          </div>
          <div class="review-tags">
            <span v-for="tag in reviewTags" :key="tag.label" class="review-tag">
              {{ tag.label }}<span>{{ tag.count }}条</span>
            </span>
          </div>
          <button type="button" class="see-all-reviews">查看全部评价 ›</button>
        </section>

        <div style="height: var(--space-4)" />
      </main>

      <!-- 底部操作栏 -->
      <div class="action-bar at-bottom">
        <button type="button" class="action-icon" aria-label="客服" @click="goSupport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>客服</span>
        </button>
        <button type="button" class="action-icon" aria-label="购物车" @click="goCart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="cartBadge" class="cart-badge">{{ cartBadge }}</span>
          <span>购物车</span>
        </button>
        <div class="btn-group-buy">
          <button type="button" class="btn-add-cart" @click="openSku('cart')">加入购物车</button>
          <button type="button" class="btn-buy-now" @click="openSku('buy')">立即购买</button>
        </div>
      </div>

      <SmSkuSheet
        v-model:show="showSkuSheet"
        :product="product"
        :selected-sku-id="selectedSkuId"
        :mode="skuMode"
        @update:selected-sku-id="selectedSkuId = $event"
        @confirm="onSkuConfirm"
      />
    </template>
    <van-empty v-else description="商品不存在" />
  </div>
</template>
