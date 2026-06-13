<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { createListing, fetchTradeConfig, fetchUserNftDetail, type UserNftDetail } from '@/api/nft';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const detail = ref<UserNftDetail | null>(null);
const feeRate = ref(0.05);
const dealPremiumPct = ref(0.1);

const kycPassed = computed(() => userStore.userInfo?.kycStatus === 'passed');

const dealRangeText = computed(() => {
  if (!detail.value) return '';
  return `${detail.value.dealPriceMin} ~ ${detail.value.dealPriceMax}`;
});

const estimateIncome = computed(() => {
  if (!detail.value) return 0;
  const maxPrice = detail.value.dealPriceMax;
  const fee = Math.round(maxPrice * feeRate.value * 100) / 100;
  return Math.round((maxPrice - fee) * 100) / 100;
});

async function load() {
  loading.value = true;
  try {
    const [cfg, item] = await Promise.all([
      fetchTradeConfig(),
      fetchUserNftDetail(route.params.userNftId as string),
      userStore.refreshProfile(),
    ]);
    feeRate.value = cfg.feeRate;
    dealPremiumPct.value = cfg.dealPremiumPct;
    detail.value = item;
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!detail.value) return;

  if (!kycPassed.value) {
    showToast('请先完成实名认证');
    router.push('/kyc');
    return;
  }

  if (detail.value.status !== 'holding') {
    showToast('当前藏品不可挂单');
    return;
  }

  await showConfirmDialog({
    title: '确认挂单',
    message: `当前参考价 ${detail.value.currentPrice}，买家成交价将在 ${dealRangeText.value} 贡献金范围内随机确定，预计最高到账 ${estimateIncome.value} 提现金`,
  });

  submitting.value = true;
  try {
    await createListing({ userNftId: detail.value.id });
    showToast('挂单成功');
    router.replace('/nft/listings');
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="挂单卖出" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="detail">
      <div class="header">
        <van-image width="72" height="72" fit="cover" :src="detail.cover" />
        <div>
          <div class="name">{{ detail.name }}</div>
          <div class="serial">编号 {{ detail.serialNo }}</div>
        </div>
      </div>

      <van-cell-group inset>
        <van-cell title="当前参考价" :value="`${detail.currentPrice ?? '—'} 贡献金`" />
        <van-cell title="买家成交价区间" :value="`${dealRangeText} 贡献金`" />
        <van-cell title="平台手续费" :value="`${(feeRate * 100).toFixed(1)}%`" />
        <van-cell title="预计最高到账" :value="`${estimateIncome} 提现金`" />
        <van-cell title="实名状态" :value="kycPassed ? '已认证' : '未认证'" />
      </van-cell-group>

      <div class="tip">
        挂单后买家购买时，成交价按「当前价 + 随机溢价（最高 {{ (dealPremiumPct * 100).toFixed(0) }}%）」计算；卖家所得入提现金。
      </div>

      <div class="footer">
        <van-button block type="primary" :loading="submitting" @click="onSubmit">
          确认挂单
        </van-button>
      </div>
    </template>

    <van-empty v-else description="藏品不存在" />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;
}
.name {
  font-weight: 600;
  font-size: 16px;
}
.serial {
  color: #969799;
  font-size: 13px;
  margin-top: 6px;
}
.tip {
  padding: 12px 16px;
  color: #969799;
  font-size: 13px;
  line-height: 1.6;
}
.footer {
  padding: 16px;
}
</style>
