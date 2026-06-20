<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { OrderDetail, ProductListItem } from '@sharemall/shared';
import { fetchOrderDetail } from '@/api/order';
import { fetchHome } from '@/api/product';
import SmProductCard from '@/components/shop/SmProductCard.vue';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;
const order = ref<OrderDetail | null>(null);
const recommends = ref<ProductListItem[]>([]);
const loading = ref(true);

const accruedFund = computed(() => {
  const raw = route.query.accruedFund ?? order.value?.accruedFund ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
});

const payChannel = computed(() => {
  const ch = route.query.channel;
  if (ch === 'alipay') return '支付宝';
  if (ch === 'wechat') return '微信支付';
  return order.value?.payMethod ?? '在线支付';
});

const itemCount = computed(() =>
  order.value?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
);

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(async () => {
  try {
    order.value = await fetchOrderDetail(orderId).catch(() => null);
    const home = await fetchHome().catch(() => null);
    recommends.value = home?.products.slice(0, 6) ?? [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-shop payment-result-page">
    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="result-page">
      <section class="success-illustration">
        <div class="check-circle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </section>

      <section class="amount-section">
        <h2>支付成功</h2>
        <p v-if="order" class="amount-value">
          <span class="currency">¥</span>{{ formatMoney(order.payAmount) }}
        </p>
      </section>

      <section v-if="order" class="order-info-card">
        <div class="info-row">
          <span class="info-label">订单号</span>
          <span class="info-value num">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">商品</span>
          <span class="info-value">共{{ itemCount }}件</span>
        </div>
        <div class="info-row">
          <span class="info-label">支付方式</span>
          <span class="info-value">{{ payChannel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">下单时间</span>
          <span class="info-value num">{{ formatDateTime(order.createdAt) }}</span>
        </div>
      </section>

      <section class="contrib-card">
        <p class="contrib-heading">确认收货后可获待兑现贡献金</p>
        <p class="contrib-amount">
          <span class="currency">¥</span>{{ formatMoney(accruedFund) }}
        </p>
        <p class="contrib-note">待兑现贡献金需达到档位(90/180/360/720)后可开始打卡兑现</p>
        <button type="button" class="contrib-link" @click="router.push('/fund')">
          了解贡献金规则 →
        </button>
      </section>

      <section class="action-buttons">
        <button type="button" class="btn btn-secondary" @click="router.push(`/orders/${orderId}`)">
          查看订单
        </button>
        <button type="button" class="btn btn-outline-accent" @click="router.push('/home')">
          继续购物
        </button>
      </section>

      <section v-if="recommends.length" class="recommend-section">
        <div class="section-header result-section-header">
          <h3>猜你还想买</h3>
        </div>
        <div class="recommend-scroll">
          <SmProductCard
            v-for="p in recommends"
            :key="p.id"
            :title="p.title"
            :image="p.mainImage"
            :price="p.price"
            @click="router.push(`/product/${p.id}`)"
          />
        </div>
      </section>
    </main>
  </div>
</template>
