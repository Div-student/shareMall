<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { createListing, fetchTradeConfig, fetchUserNftDetail, type UserNftDetail } from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
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
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const agreed = ref(false);
const detail = ref<UserNftDetail | null>(null);
const feeRate = ref(0.05);

const kycPassed = computed(() => userStore.userInfo?.kycStatus === 'passed');

const referencePrice = computed(() => detail.value?.currentPrice ?? 0);

const feeAmount = computed(() => roundMoney(referencePrice.value * feeRate.value));

const minIncome = computed(() => {
  if (!detail.value) return 0;
  return roundMoney(detail.value.currentPrice! * (1 - feeRate.value));
});

const maxIncome = computed(() => {
  if (!detail.value) return 0;
  return roundMoney(detail.value.dealPriceMax * (1 - feeRate.value));
});

const feePercentText = computed(() => `${(feeRate.value * 100).toFixed(0)}%`);

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatRange(min: number, max: number) {
  return `¥${min} ~ ¥${max}`;
}

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function thumbLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '藏品';
  return trimmed.slice(0, 2);
}

function toggleAgree() {
  agreed.value = !agreed.value;
}

async function load() {
  loading.value = true;
  try {
    const [cfg, item] = await Promise.all([
      fetchTradeConfig(),
      fetchUserNftDetail(route.params.userNftId as string),
      userStore.refreshProfile(),
    ]);
    feeRate.value = cfg.feeRate;
    detail.value = item;
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!detail.value || !agreed.value || submitting.value) return;

  if (!kycPassed.value) {
    showToast('请先完成实名认证');
    router.push('/kyc');
    return;
  }

  if (detail.value.status !== 'holding') {
    showToast('当前藏品不可挂单');
    return;
  }

  submitting.value = true;
  try {
    await createListing({ userNftId: detail.value.id });
    showToast('挂单提交成功');
    router.replace('/nft/listings');
  } catch {
    /* toast handled by interceptor */
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop collectible-sell-page has-action-bar">
    <SmAppHeader title="挂单卖出" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else-if="detail" class="page-body collectible-sell-body with-action-bar">
      <div class="sell-header">
        <div class="sell-thumb">
          <img v-if="detail.cover" :src="detail.cover" :alt="detail.name">
          <div
            v-else
            class="ph-img"
            :style="{ background: thumbGradient(detail.id) }"
          >
            {{ thumbLabel(detail.name) }}
          </div>
        </div>
        <div class="sell-info">
          <div class="sell-name">{{ detail.name }}</div>
          <div class="sell-id">No. {{ detail.serialNo }}</div>
        </div>
      </div>

      <div class="price-display">
        <div class="price-main-label">当前参考价</div>
        <div class="price-main-value">
          <span class="yuan">¥</span>{{ referencePrice }}
        </div>
        <div class="price-range">
          <span class="range-label">成交价格区间</span>
          <span class="range-value">{{ formatRange(detail.dealPriceMin, detail.dealPriceMax) }}</span>
        </div>
      </div>

      <div class="explanation-card">
        <div class="explanation-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          交易定价说明
        </div>
        <div class="explanation-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          系统按当前参考价自动挂单，无需手动定价
        </div>
        <div class="explanation-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          买家成交价由系统在区间内随机确定，确保公平
        </div>
        <div class="explanation-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          成交后资金将自动计入提现金，可随时提现
        </div>
      </div>

      <div class="fee-card">
        <div class="fee-title">费用预估</div>
        <div class="fee-row">
          <span class="fee-label">参考价格</span>
          <span class="fee-value">¥{{ formatMoney(referencePrice) }}</span>
        </div>
        <div class="fee-row">
          <span class="fee-label">平台手续费</span>
          <span class="fee-value">{{ feePercentText }}（¥{{ formatMoney(feeAmount) }}）</span>
        </div>
        <div class="fee-row total">
          <span class="fee-label">预估到账（提现金）</span>
          <span class="fee-value accent">¥{{ formatMoney(minIncome) }} ~ ¥{{ formatMoney(maxIncome) }}</span>
        </div>
      </div>

      <div v-if="!kycPassed" class="verify-notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        需完成实名认证后方可挂单卖出
      </div>

      <button
        type="button"
        class="toggle-agree"
        :class="{ agreed }"
        @click="toggleAgree"
      >
        <div class="agree-checkbox" />
        <div class="agree-text">
          我已了解交易规则：参考价仅作参考，实际成交价在价格区间内由系统随机确定，手续费从成交金额中扣除。
        </div>
      </button>

      <div style="height: var(--space-4)" />
    </main>

    <div v-else class="collectible-sell-empty">
      <van-empty description="藏品不存在" />
    </div>

    <div v-if="detail && !loading" class="action-bar at-bottom">
      <button
        type="button"
        class="btn-submit"
        :disabled="!agreed || submitting"
        @click="onSubmit"
      >
        确认挂单
      </button>
    </div>
  </div>
</template>
