<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { applyWithdraw, fetchWithdrawConfig, type WithdrawConfig } from '@/api/withdraw';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

type WithdrawMethod = 'bank' | 'wechat' | 'alipay';

const METHOD_DETAILS: Record<WithdrawMethod, string> = {
  wechat: '微信零钱',
  alipay: '支付宝账户',
  bank: '尾号 8888',
};

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const config = ref<WithdrawConfig | null>(null);
const amount = ref('');
const method = ref<WithdrawMethod>('wechat');

const balance = computed(() => fundStore.account?.withdrawableCash ?? 0);
const balanceText = computed(() => balance.value.toFixed(2));

const fee = computed(() => {
  const val = Number(amount.value) || 0;
  if (!config.value || val <= 0) return 0;
  return Math.round(Math.max(config.value.fee, val * config.value.feeRate) * 100) / 100;
});

const actualAmount = computed(() => {
  const val = Number(amount.value) || 0;
  if (val <= 0) return 0;
  return Math.round(Math.max(val - fee.value, 0) * 100) / 100;
});

const receiveText = computed(() => {
  const val = Number(amount.value);
  if (!val || val <= 0) return '¥0.00';
  return `¥${actualAmount.value.toFixed(2)}`;
});

const feeRateText = computed(() => {
  if (!config.value) return '0%';
  const pct = config.value.feeRate * 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`;
});

const kycPassed = computed(() => userStore.userInfo?.kycStatus === 'passed');

const availableMethods = computed(() => {
  const methods = config.value?.methods ?? ['wechat', 'alipay', 'bank'];
  return methods.filter((m): m is WithdrawMethod => m in METHOD_DETAILS);
});

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/mine');
  }
}

function fillAll() {
  amount.value = balance.value > 0 ? balance.value.toFixed(2) : '';
}

function selectMethod(next: WithdrawMethod) {
  method.value = next;
}

function buildAccountInfo(selected: WithdrawMethod): Record<string, string> {
  const name = userStore.userInfo?.nickname?.trim() || '用户';
  const phone = userStore.userInfo?.phone || '';
  if (selected === 'bank') {
    return {
      accountName: name,
      bankName: '中国银行',
      cardNo: '6225888888888888',
    };
  }
  return {
    accountName: name,
    accountNo: phone,
  };
}

async function load() {
  loading.value = true;
  try {
    const [cfg] = await Promise.all([
      fetchWithdrawConfig(),
      fundStore.fetchAccount(),
      userStore.refreshProfile(),
    ]);
    config.value = cfg;
    if (cfg.methods.length) {
      const first = cfg.methods.find((m): m is WithdrawMethod => m in METHOD_DETAILS);
      if (first) method.value = first;
    }
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!kycPassed.value) {
    showToast('请先完成实名认证');
    router.push('/kyc');
    return;
  }

  const val = Number(amount.value);
  if (!val || val <= 0) {
    showToast('请输入提现金额');
    return;
  }
  if (config.value && val < config.value.min) {
    showToast(`最低提现 ${config.value.min} 元`);
    return;
  }
  if (val > balance.value) {
    showToast('提现金额不能超过可提现余额');
    return;
  }

  submitting.value = true;
  try {
    await applyWithdraw({
      amount: val,
      method: method.value,
      accountInfo: buildAccountInfo(method.value),
    });
    showToast('提现申请已提交');
    amount.value = '';
    await fundStore.fetchAccount();
  } catch {
    /* toast handled by interceptor */
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop withdraw-page">
    <SmAppHeader title="提现" fixed @back="goBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else class="page-body withdraw-body">
      <div class="page-content">
        <div class="balance-card">
          <div class="balance-label">可提现余额</div>
          <div class="balance-amount">
            <span class="yuan">¥</span><span>{{ balanceText }}</span>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">提现金额</div>
          <div class="amount-input-wrap">
            <span class="prefix">¥</span>
            <input
              v-model="amount"
              type="number"
              class="amount-input"
              placeholder="输入提现金额"
              min="0"
              step="0.01"
            >
          </div>
          <div class="amount-actions">
            <span class="amount-hint">可提现¥<span class="num">{{ balanceText }}</span></span>
            <button type="button" class="btn-all" @click="fillAll">全部提现</button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">提现方式</div>
          <div class="method-list">
            <button
              v-for="item in availableMethods"
              :key="item"
              type="button"
              class="method-item"
              :class="{ selected: method === item }"
              @click="selectMethod(item)"
            >
              <div class="method-icon" :class="item">
                <svg
                  v-if="item === 'wechat'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.86-1.1a.61.61 0 0 1 .484-.064c1.096.362 2.286.564 3.532.564.136 0 .27-.004.404-.01-.297-.79-.462-1.634-.462-2.513 0-4.093 3.844-7.413 8.586-7.413.134 0 .267.004.4.01C16.44 4.302 12.89 2.188 8.691 2.188zm7.585 7.39c-4.198 0-7.586 2.914-7.586 6.513 0 3.6 3.388 6.513 7.586 6.513 1.075 0 2.104-.187 3.048-.529a.5.5 0 0 1 .388.05l1.484.88a.27.27 0 0 0 .134.044c.13 0 .232-.108.232-.24 0-.06-.023-.116-.039-.172l-.313-1.186a.475.475 0 0 1 .171-.533C22.93 19.756 23.863 18.14 23.863 16.09c0-3.6-3.387-6.513-7.586-6.513z" />
                </svg>
                <svg
                  v-else-if="item === 'alipay'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21.422 13.464C19.622 12.612 17.454 11.862 15.39 11.28c.72-1.56 1.224-3.3 1.422-5.082h-4.26v-2.4H8.562v2.4H4.302v2.058h8.16c-.156 1.368-.546 2.7-1.122 3.9-1.602-.39-3.156-.648-4.518-.648-2.862 0-4.764 1.17-4.764 3.06 0 1.89 1.8 3.06 4.56 3.06 2.256 0 4.236-.918 5.73-2.448 1.638.72 3.342 1.572 4.878 2.49L18 16.134c-1.2-.72-2.55-1.422-3.978-2.046 1.026-1.44 1.776-3.078 2.16-4.8 1.812.546 3.69 1.254 5.28 2.076l.96-1.9z" />
                </svg>
                <svg
                  v-else
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v7M12 14v7M16 14v7" />
                </svg>
              </div>
              <div class="method-info">
                <div class="method-name">
                  {{ item === 'wechat' ? '微信' : item === 'alipay' ? '支付宝' : '银行卡' }}
                </div>
                <div class="method-detail">{{ METHOD_DETAILS[item] }}</div>
              </div>
              <div class="method-check" />
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">费用明细</div>
          <div class="fee-row">
            <span class="fee-label">提现手续费</span>
            <span class="fee-value">{{ feeRateText }}</span>
          </div>
          <div class="fee-row highlight">
            <span class="fee-label">预计到账</span>
            <span class="fee-value">{{ receiveText }}</span>
          </div>
          <div class="fee-row">
            <span class="fee-label">到账时间</span>
            <span class="fee-value">1-3个工作日</span>
          </div>
        </div>

        <div v-if="!kycPassed" class="kyc-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            需完成实名认证后方可提现，<button type="button" class="kyc-link" @click="router.push('/kyc')">去认证</button>
          </span>
        </div>

        <button
          type="button"
          class="submit-btn"
          :disabled="submitting"
          @click="onSubmit"
        >
          {{ submitting ? '提交中...' : '申请提现' }}
        </button>

        <button type="button" class="records-link" @click="router.push('/withdraw/records')">
          提现记录
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>
