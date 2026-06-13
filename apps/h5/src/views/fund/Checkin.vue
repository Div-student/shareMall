<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchCheckinPlan, signCheckin, startCheckin } from '@/api/fund';
import { useFundStore } from '@/stores/fund';
import type { CheckinPlan } from '@sharemall/shared';

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const signing = ref(false);
const plan = ref<CheckinPlan | null>(null);
const selectedTier = ref<number | null>(null);

const progressText = computed(() => {
  if (!plan.value) return '-';
  return `${plan.value.signedDays} / ${plan.value.totalDays}`;
});

onMounted(async () => {
  await fundStore.fetchAccount();
  const active = fundStore.account?.activePlan;
  if (active) {
    plan.value = await fetchCheckinPlan(active.id);
  } else {
    const reached = fundStore.account?.tiers.filter((t) => t.reached) ?? [];
    selectedTier.value = reached.length ? reached[reached.length - 1].tier : null;
  }
  loading.value = false;
});

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
  <div class="page">
    <van-nav-bar title="打卡兑现" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="plan">
      <van-cell-group inset>
        <van-cell title="当前档位" :value="`${plan.tier} 档`" />
        <van-cell title="每日可兑现" :value="String(plan.dailyAmount)" />
        <van-cell title="签到进度" :value="progressText" />
        <van-cell title="已兑现" :value="String(plan.cashedAmount)" />
        <van-cell title="作废金额" :value="String(plan.voidAmount)" />
        <van-cell title="状态" :value="plan.status === 'active' ? '进行中' : '已结束'" />
      </van-cell-group>
      <div style="padding: 16px">
        <van-button
          block
          type="primary"
          :loading="signing"
          :disabled="plan.status !== 'active'"
          @click="onSign"
        >
          今日打卡
        </van-button>
        <van-button block plain style="margin-top: 8px" @click="router.push('/fund/checkin/records')">
          查看打卡记录
        </van-button>
      </div>
    </template>

    <template v-else>
      <van-cell-group inset>
        <van-cell title="可开启档位" :value="selectedTier ? `${selectedTier} 档` : '未达标'" />
        <van-cell title="打卡天数" :value="String(fundStore.account?.rules?.checkinDays ?? 30)" />
      </van-cell-group>
      <div style="padding: 16px">
        <van-button block type="primary" :loading="signing" :disabled="!selectedTier" @click="onStart">
          开启打卡计划
        </van-button>
      </div>
    </template>

    <van-notice-bar
      wrapable
      :scrollable="false"
      text="规则：达到档位后开启打卡，按天平均兑现到可用贡献金，漏打卡当天收益作废。"
    />
  </div>
</template>
