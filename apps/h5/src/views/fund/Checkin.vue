<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchCheckinPlan, signCheckin, startCheckin } from '@/api/fund';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';
import type { CheckinPlan } from '@sharemall/shared';

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const signing = ref(false);
const plan = ref<CheckinPlan | null>(null);
const selectedTier = ref<number | null>(null);

const checkinDays = computed(() => fundStore.account?.rules?.checkinDays ?? 30);

const progressText = computed(() => {
  if (!plan.value) return '-';
  return `${plan.value.signedDays} / ${plan.value.totalDays}`;
});

const progressPercent = computed(() => {
  if (!plan.value?.totalDays) return 0;
  return Math.min((plan.value.signedDays / plan.value.totalDays) * 100, 100);
});

const statusLabel = computed(() => {
  if (!plan.value) return '';
  return plan.value.status === 'active' ? '进行中' : '已结束';
});

const statusClass = computed(() =>
  plan.value?.status === 'active' ? 'status-active' : 'status-ended',
);

const primaryLabel = computed(() => (plan.value ? '今日打卡' : '开启打卡计划'));

const primaryDisabled = computed(() => {
  if (signing.value) return true;
  if (plan.value) return plan.value.status !== 'active';
  return !selectedTier.value;
});

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

onMounted(initPage);
onActivated(initPage);

async function initPage() {
  loading.value = true;
  try {
    await fundStore.fetchAccount();
    const active = fundStore.account?.activePlan;
    if (active) {
      plan.value = await fetchCheckinPlan(active.id);
    } else {
      plan.value = null;
      const reached = fundStore.account?.tiers.filter((t) => t.reached) ?? [];
      selectedTier.value = reached.length ? reached[reached.length - 1].tier : null;
    }
  } finally {
    loading.value = false;
  }
}

async function onPrimaryAction() {
  if (plan.value) {
    await onSign();
    return;
  }
  await onStart();
}

async function onStart() {
  if (!selectedTier.value) {
    showToast('暂无达标档位');
    return;
  }
  signing.value = true;
  try {
    const result = await startCheckin(selectedTier.value);
    plan.value = result;
    await fundStore.fetchAccount();
    showToast('打卡计划已开启');
  } finally {
    signing.value = false;
  }
}

async function onSign() {
  if (!plan.value) return;
  signing.value = true;
  try {
    const result = await signCheckin(plan.value.id);
    plan.value = result.plan;
    await fundStore.fetchAccount();
    showToast(`打卡成功，兑现 ${result.cashoutAmount}`);
  } finally {
    signing.value = false;
  }
}
</script>

<template>
  <div class="page-shop checkin-page">
    <SmAppHeader title="打卡兑现" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else class="page-body with-checkin-action">
      <div class="page-content">
        <template v-if="plan">
          <div class="plan-hero">
            <div class="plan-hero-label">当前档位</div>
            <div class="plan-hero-tier">¥{{ plan.tier }} 档 · 打卡兑现中</div>
            <div class="plan-hero-sub">
              <div class="plan-hero-sub-item">
                <span class="plan-hero-sub-label">每日可兑现</span>
                <span class="plan-hero-sub-value">
                  <span class="yuan">¥</span>{{ formatMoney(plan.dailyAmount) }}
                </span>
              </div>
              <div class="plan-hero-sub-item">
                <span class="plan-hero-sub-label">签到进度</span>
                <span class="plan-hero-sub-value">{{ progressText }}</span>
              </div>
            </div>
          </div>

          <div class="progress-block">
            <div class="progress-block-head">
              <span>{{ plan.totalDays }} 天打卡进度</span>
              <span class="num">{{ plan.signedDays }}/{{ plan.totalDays }}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
            </div>
          </div>

          <div class="info-card">
            <div class="info-row">
              <span class="info-row-label">当前档位</span>
              <span class="info-row-value">{{ plan.tier }} 档</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">每日可兑现</span>
              <span class="info-row-value">{{ formatMoney(plan.dailyAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">签到进度</span>
              <span class="info-row-value">{{ progressText }}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">已兑现</span>
              <span class="info-row-value">{{ formatMoney(plan.cashedAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">作废金额</span>
              <span class="info-row-value void">{{ formatMoney(plan.voidAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">状态</span>
              <span class="info-row-value" :class="statusClass">{{ statusLabel }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="start-card">
            <div class="start-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="start-title">开启打卡计划</div>
            <div class="start-desc">
              达到档位后，按天平均兑现到可用贡献金<br />漏打卡当天收益作废
            </div>
            <div class="start-tier" :class="{ muted: !selectedTier }">
              <template v-if="selectedTier">
                <span class="yuan">¥</span>{{ selectedTier }} 档 · 可开启
              </template>
              <template v-else>暂无达标档位</template>
            </div>
          </div>

          <div class="info-card">
            <div class="info-row">
              <span class="info-row-label">可开启档位</span>
              <span class="info-row-value">{{ selectedTier ? `${selectedTier} 档` : '未达标' }}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">打卡天数</span>
              <span class="info-row-value">{{ checkinDays }}</span>
            </div>
          </div>
        </template>

        <div class="rules-notice">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>规则：达到档位后开启打卡，按天平均兑现到可用贡献金，漏打卡当天收益作废。</span>
        </div>
      </div>
    </main>

    <div v-if="!loading" class="checkin-action">
      <button
        type="button"
        class="btn btn-primary btn-block btn-lg"
        :disabled="primaryDisabled"
        @click="onPrimaryAction"
      >
        {{ signing ? '处理中...' : primaryLabel }}
      </button>
      <button
        v-if="plan"
        type="button"
        class="btn btn-secondary btn-block checkin-action-secondary"
        @click="router.push('/fund/checkin/records')"
      >
        查看打卡记录
      </button>
    </div>
  </div>
</template>
