<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';

const TIER_UNLOCK_HINT: Record<number, string> = {
  90: '累计购物满 ¥500 解锁',
  180: '累计购物满 ¥1,000 解锁',
  720: '累计购物满 ¥5,000 解锁',
};

interface TierCardView {
  tier: number;
  isLocked: boolean;
  isCurrent: boolean;
  btnClass: string;
  btnText: string;
  btnDisabled: boolean;
  progressPercent: number;
  progressLeft: string;
  progressRight: string;
  actionable: boolean;
}

const router = useRouter();
const fundStore = useFundStore();
const { account } = storeToRefs(fundStore);

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function refreshAccount() {
  void fundStore.fetchAccount();
}

onMounted(refreshAccount);
onActivated(refreshAccount);

const tierCards = computed<TierCardView[]>(() => {
  const pending = account.value?.pendingFund ?? 0;
  const plan = account.value?.activePlan;
  const tiers = account.value?.tiers ?? [];

  return tiers.map(({ tier, reached }) => {
    const isActiveTier = plan?.status === 'active' && plan.tier === tier;

    if (isActiveTier && plan) {
      const progressPercent = plan.totalDays ? (plan.signedDays / plan.totalDays) * 100 : 0;
      return {
        tier,
        isLocked: false,
        isCurrent: true,
        btnClass: 'start-btn',
        btnText: '开始打卡',
        btnDisabled: false,
        progressPercent,
        progressLeft: `已兑现 ¥${formatMoney(plan.cashedAmount)}`,
        progressRight: `第${plan.signedDays}天/${plan.totalDays}天`,
        actionable: true,
      };
    }

    if (!reached) {
      const progressPercent = tier > 0 ? Math.min((pending / tier) * 100, 100) : 0;
      return {
        tier,
        isLocked: true,
        isCurrent: false,
        btnClass: 'locked-btn',
        btnText: '未解锁',
        btnDisabled: true,
        progressPercent,
        progressLeft: `已累计 ¥${formatMoney(pending)}`,
        progressRight: TIER_UNLOCK_HINT[tier] ?? `待兑现满 ¥${tier} 可开启`,
        actionable: false,
      };
    }

    if (plan?.status === 'active') {
      return {
        tier,
        isLocked: false,
        isCurrent: false,
        btnClass: 'current-btn',
        btnText: '打卡进行中',
        btnDisabled: true,
        progressPercent: 100,
        progressLeft: `已累计 ¥${formatMoney(pending)}`,
        progressRight: `当前 ${plan.tier} 档打卡中`,
        actionable: false,
      };
    }

    return {
      tier,
      isLocked: false,
      isCurrent: false,
      btnClass: 'start-btn',
      btnText: '开始打卡',
      btnDisabled: false,
      progressPercent: 100,
      progressLeft: `已累计 ¥${formatMoney(pending)}`,
      progressRight: '可开启打卡',
      actionable: true,
    };
  });
});

function onTierAction(card: TierCardView) {
  if (!card.actionable) return;
  router.push('/fund/checkin');
}
</script>

<template>
  <div class="page-shop contribution-center-page">
    <SmAppHeader title="贡献金中心" fixed @back="router.back()" />

    <main class="page-body contribution-center-body">
      <div class="hero-card">
        <div class="hero-label">待兑现贡献金</div>
        <div class="hero-amount">
          <span class="yuan">¥</span>{{ formatMoney(account?.pendingFund ?? 0) }}
        </div>
        <div class="hero-sub-row">
          <div class="hero-sub-item">
            <span class="hero-sub-label">可用贡献金</span>
            <span class="hero-sub-value">
              <span class="yuan">¥</span>{{ formatMoney(account?.availableFund ?? 0) }}
            </span>
          </div>
          <div class="hero-sub-item">
            <span class="hero-sub-label">提现金</span>
            <span class="hero-sub-value">
              <span class="yuan">¥</span>{{ formatMoney(account?.withdrawableCash ?? 0) }}
              <span class="withdrawable-tag">可提现</span>
            </span>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button type="button" class="action-btn" @click="router.push('/fund/records')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          明细
        </button>
        <button type="button" class="action-btn" @click="router.push('/nft/market')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          兑换藏品
        </button>
        <button type="button" class="action-btn" @click="router.push('/withdraw')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          提现
        </button>
      </div>

      <div class="section-gap" />

      <section class="tier-section">
        <h3 class="tier-section-title">打卡档位</h3>
        <div class="tier-list">
          <article
            v-for="card in tierCards"
            :key="card.tier"
            class="tier-card"
            :class="{ locked: card.isLocked, current: card.isCurrent }"
          >
            <div class="tier-header">
              <div class="tier-badge">
                <span class="yuan">¥</span>{{ card.tier }}<span class="suffix">档</span>
              </div>
              <button
                type="button"
                class="tier-action-btn"
                :class="card.btnClass"
                :disabled="card.btnDisabled"
                @click="onTierAction(card)"
              >
                {{ card.btnText }}
              </button>
            </div>
            <div class="tier-progress-bar">
              <div class="tier-progress-fill" :style="{ width: `${card.progressPercent}%` }" />
            </div>
            <div class="tier-progress-info">
              <span>{{ card.progressLeft }}</span>
              <span>{{ card.progressRight }}</span>
            </div>
          </article>
        </div>
      </section>

      <div class="section-gap" />

      <div class="quick-links">
        <button type="button" class="quick-link" @click="router.push('/fund/checkin')">
          <div class="quick-link-icon quick-link-icon--accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <span class="quick-link-text">打卡兑现</span>
        </button>
        <button type="button" class="quick-link" @click="router.push('/tasks')">
          <div class="quick-link-icon quick-link-icon--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span class="quick-link-text">任务中心</span>
        </button>
      </div>
    </main>
  </div>
</template>
