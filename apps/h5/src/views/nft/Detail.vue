<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { storeToRefs } from 'pinia';
import SmActionBar from '@/components/shop/SmActionBar.vue';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmPriceChart from '@/components/shop/SmPriceChart.vue';
import { exchangeNft, fetchNftDetail, type NftDetail } from '@/api/nft';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const GRADIENTS = [
  'linear-gradient(135deg,#2d1b4e,#c96442)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#3a0a2a,#f47a8a)',
];

const route = useRoute();
const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();
const { account } = storeToRefs(fundStore);
const { isLoggedIn } = storeToRefs(userStore);

const loading = ref(true);
const exchanging = ref(false);
const nft = ref<NftDetail | null>(null);

const dealRangeText = computed(() => {
  if (!nft.value) return '';
  return `¥${nft.value.dealPriceMin} ~ ¥${nft.value.dealPriceMax}`;
});

const stockTag = computed(() => {
  if (!nft.value) return { label: '', class: '' };
  if (nft.value.stock > 0) return { label: '可兑换', class: 'tag-success' };
  return { label: '已售罄', class: 'tag-danger' };
});

const canExchange = computed(() => {
  if (!nft.value || nft.value.stock <= 0) return false;
  if (!isLoggedIn.value) return false;
  return (account.value?.availableFund ?? 0) >= nft.value.dealPriceMax;
});

const limitText = computed(() => {
  if (!nft.value?.limitPerUser) return '不限';
  return `每人限兑 ${nft.value.limitPerUser} 份`;
});

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

async function load() {
  loading.value = true;
  try {
    nft.value = await fetchNftDetail(route.params.id as string);
  } catch {
    nft.value = null;
  } finally {
    loading.value = false;
  }
}

async function onExchange() {
  if (!nft.value) return;

  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  if (!canExchange.value) {
    showToast('可用贡献金不足或库存已售罄');
    return;
  }

  await showConfirmDialog({
    title: '确认兑换',
    message: `当前参考价 ${nft.value.currentPrice}，成交将在 ${dealRangeText.value} 贡献金范围内随机确定，是否继续？`,
  });

  exchanging.value = true;
  try {
    const res = await exchangeNft(nft.value.id);
    showToast(`兑换成功，成交价 ${res.dealPrice}，编号 ${res.serialNo}`);
    await Promise.all([load(), fundStore.fetchAccount()]);
    router.push('/nft/mine');
  } finally {
    exchanging.value = false;
  }
}

onMounted(async () => {
  if (isLoggedIn.value) {
    await fundStore.fetchAccount();
  }
  await load();
});
</script>

<template>
  <div class="page-shop collectible-shop-detail-page has-action-bar">
    <SmAppHeader title="藏品详情" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else-if="nft" class="page-body shop-detail-body with-action-bar">
      <section class="holding-hero">
        <img
          v-if="nft.cover"
          :src="nft.cover"
          :alt="nft.name"
          class="holding-cover"
        >
        <div
          v-else
          class="ph-img holding-cover-placeholder"
          :style="{ background: thumbGradient(nft.id) }"
        >
          {{ thumbLabel(nft.name) }}
        </div>
      </section>

      <section class="holding-info">
        <h1 class="holding-name">{{ nft.name }}</h1>
        <div class="holding-id-row">
          <span class="holding-id num">剩余 {{ nft.stock }}</span>
          <span class="holding-total num">/ {{ nft.totalSupply }}</span>
        </div>
      </section>

      <div class="info-card">
        <div class="info-row">
          <span class="row-label">当前参考价</span>
          <span class="row-value price-accent num">¥{{ formatMoney(nft.currentPrice) }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">成交区间</span>
          <span class="row-value num">{{ dealRangeText }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">状态</span>
          <span class="row-value">
            <span class="tag" :class="stockTag.class">{{ stockTag.label }}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="row-label">已兑换</span>
          <span class="row-value num">{{ nft.soldCount }} 份</span>
        </div>
        <div class="info-row">
          <span class="row-label">限购</span>
          <span class="row-value">{{ limitText }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">发行方</span>
          <span class="row-value">{{ nft.publisher || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="row-label">起始价格</span>
          <span class="row-value num">¥{{ formatMoney(nft.startPrice) }}</span>
        </div>
        <div v-if="isLoggedIn" class="info-row">
          <span class="row-label">我的可用贡献金</span>
          <span class="row-value num">¥{{ formatMoney(account?.availableFund ?? 0) }}</span>
        </div>
      </div>

      <SmPriceChart :data="nft.priceHistory" />

      <div v-if="nft.rightsDesc" class="rights-card">
        <div class="rights-title">权益说明</div>
        <div class="rights-content">{{ nft.rightsDesc }}</div>
      </div>

      <div class="shop-detail-spacer" />
    </main>

    <van-empty v-else description="藏品不存在或已下架" />

    <SmActionBar v-if="nft">
      <button
        type="button"
        class="btn btn-primary btn-block btn-lg shop-exchange-btn"
        :disabled="nft.stock <= 0 || exchanging"
        @click="onExchange"
      >
        {{ exchanging ? '兑换中...' : nft.stock <= 0 ? '已售罄' : `立即兑换（约 ${dealRangeText}）` }}
      </button>
    </SmActionBar>
  </div>
</template>
