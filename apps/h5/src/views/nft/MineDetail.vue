<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchNftDetail,
  fetchNftPriceHistory,
  fetchUserNftDetail,
  type PriceHistoryPoint,
  type UserNftDetail,
} from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmPriceChart from '@/components/shop/SmPriceChart.vue';

const GRADIENTS = [
  'linear-gradient(135deg,#2d1b4e,#c96442)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#3a0a2a,#f47a8a)',
];

type TxType = 'buy' | 'sell' | 'mint';

interface TxItem {
  type: TxType;
  desc: string;
  time: string;
  amount: string;
  amountClass: 'negative' | 'positive' | 'neutral';
}

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const detail = ref<UserNftDetail | null>(null);
const totalSupply = ref(0);
const priceHistory = ref<PriceHistoryPoint[]>([]);
const txSection = ref<HTMLElement | null>(null);

const statusMap: Record<UserNftDetail['status'], { label: string; tagClass: string }> = {
  holding: { label: '持有中', tagClass: 'tag-success' },
  listed: { label: '挂单中', tagClass: 'tag-warn' },
  sold: { label: '已售出', tagClass: 'tag-danger' },
  transferred: { label: '已转赠', tagClass: 'tag-danger' },
};

const sourceLabels: Record<UserNftDetail['source'], string> = {
  exchange: '兑换获取',
  trade_buy: '购买获取',
  transfer: '转赠获取',
};

const acquiredPrice = computed(() => {
  if (!detail.value) return null;
  const date = detail.value.acquiredAt.slice(0, 10);
  const point = priceHistory.value.find((p) => p.date === date);
  if (point) return point.price;
  if (priceHistory.value.length) return priceHistory.value[0].price;
  return detail.value.dealPriceMin ?? null;
});

const serialDisplay = computed(() => {
  if (!detail.value) return { no: '', total: '' };
  const match = detail.value.serialNo.match(/-(\d+)$/);
  const no = match ? `No. ${String(parseInt(match[1], 10)).padStart(4, '0')}` : detail.value.serialNo;
  return { no, total: totalSupply.value ? `/ ${totalSupply.value}` : '' };
});

const transactions = computed<TxItem[]>(() => {
  if (!detail.value) return [];
  const txs: TxItem[] = [];
  const price = acquiredPrice.value;

  txs.push({
    type: 'buy',
    desc: sourceLabels[detail.value.source],
    time: formatDateTime(detail.value.acquiredAt),
    amount: price != null ? `-¥${price.toFixed(2)}` : '—',
    amountClass: price != null ? 'negative' : 'neutral',
  });

  if (priceHistory.value.length) {
    txs.push({
      type: 'mint',
      desc: '铸造发行',
      time: formatDateTime(`${priceHistory.value[0].date}T10:00:00`),
      amount: '—',
      amountClass: 'neutral',
    });
  }

  for (let i = 1; i < priceHistory.value.length; i += 1) {
    const prev = priceHistory.value[i - 1];
    const curr = priceHistory.value[i];
    const delta = curr.price - prev.price;
    if (Math.abs(delta) < 0.01) continue;
    txs.push({
      type: 'sell',
      desc: '参考价更新',
      time: formatDateTime(`${curr.date}T00:00:00`),
      amount: `${delta >= 0 ? '+' : '-'}¥${Math.abs(delta).toFixed(2)}`,
      amountClass: delta >= 0 ? 'positive' : 'negative',
    });
  }

  return txs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
});

function formatDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatMoney(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function thumbLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '藏品';
  return trimmed.slice(0, 2);
}

function goSell() {
  if (!detail.value) return;
  if (detail.value.status === 'holding') {
    router.push(`/nft/mine/${detail.value.id}/sell`);
    return;
  }
  if (detail.value.status === 'listed') {
    router.push('/nft/listings');
  }
}

function scrollToHistory() {
  txSection.value?.scrollIntoView({ behavior: 'smooth' });
}

async function load() {
  loading.value = true;
  try {
    const item = await fetchUserNftDetail(route.params.userNftId as string);
    detail.value = item;
    const [history, nft] = await Promise.all([
      fetchNftPriceHistory(item.nftId, 30),
      fetchNftDetail(item.nftId),
    ]);
    priceHistory.value = history;
    totalSupply.value = nft.totalSupply;
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop collectible-holding-detail-page">
    <SmAppHeader title="藏品详情" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else-if="detail" class="page-body holding-detail-body">
      <section class="holding-hero">
        <img
          v-if="detail.cover"
          :src="detail.cover"
          :alt="detail.name"
          class="holding-cover"
        >
        <div
          v-else
          class="ph-img holding-cover-placeholder"
          :style="{ background: thumbGradient(detail.nftId) }"
        >
          {{ thumbLabel(detail.name) }}
        </div>
      </section>

      <section class="holding-info">
        <h1 class="holding-name">{{ detail.name }}</h1>
        <div class="holding-id-row">
          <span class="holding-id num">{{ serialDisplay.no }}</span>
          <span v-if="serialDisplay.total" class="holding-total num">{{ serialDisplay.total }}</span>
        </div>
      </section>

      <div class="info-card">
        <div class="info-row">
          <span class="row-label">当前参考价</span>
          <span class="row-value price-accent num">¥{{ formatMoney(detail.currentPrice ?? 0) }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">成交区间</span>
          <span class="row-value num">¥{{ detail.dealPriceMin }} ~ ¥{{ detail.dealPriceMax }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">状态</span>
          <span class="row-value">
            <span class="tag" :class="statusMap[detail.status].tagClass">{{ statusMap[detail.status].label }}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="row-label">获取时间</span>
          <span class="row-value">{{ formatDate(detail.acquiredAt) }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">获取价格</span>
          <span class="row-value num">¥{{ acquiredPrice != null ? formatMoney(acquiredPrice) : '—' }}</span>
        </div>
      </div>

      <SmPriceChart :data="priceHistory" />

      <div class="actions-row">
        <button
          type="button"
          class="btn btn-secondary"
          style="flex:1"
          @click="goSell"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {{ detail.status === 'listed' ? '查看挂单' : '挂单卖出' }}
        </button>
        <button type="button" class="btn btn-outline" style="flex:1" @click="scrollToHistory">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          交易记录
        </button>
      </div>

      <div class="section-gap" />

      <section ref="txSection" class="transaction-section">
        <div class="section-title">交易记录</div>

        <div v-for="(tx, idx) in transactions" :key="idx" class="tx-item">
          <div class="tx-icon" :class="tx.type">
            <svg
              v-if="tx.type === 'buy'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            <svg
              v-else-if="tx.type === 'mint'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
              <path d="M2 8l10-6 10 6H2z" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div class="tx-info">
            <div class="tx-desc">{{ tx.desc }}</div>
            <div class="tx-time">{{ tx.time }}</div>
          </div>
          <div
            class="tx-amount num"
            :class="{
              negative: tx.amountClass === 'negative',
              positive: tx.amountClass === 'positive',
            }"
            :style="tx.amountClass === 'neutral' ? { color: 'var(--meta)' } : undefined"
          >
            {{ tx.amount }}
          </div>
        </div>
      </section>

      <div class="holding-detail-spacer" />
    </main>

    <van-empty v-else description="藏品不存在" />
  </div>
</template>
