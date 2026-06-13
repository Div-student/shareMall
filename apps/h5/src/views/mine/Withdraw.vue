<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { applyWithdraw, fetchWithdrawConfig, type WithdrawConfig } from '@/api/withdraw';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const config = ref<WithdrawConfig | null>(null);

const form = reactive({
  amount: '',
  method: 'wechat' as 'bank' | 'wechat' | 'alipay',
  accountName: '',
  accountNo: '',
  bankName: '',
  cardNo: '',
});

const balance = computed(() => fundStore.account?.withdrawableCash ?? 0);

const fee = computed(() => {
  const amount = Number(form.amount) || 0;
  if (!config.value || amount <= 0) return 0;
  return Math.round(Math.max(config.value.fee, amount * config.value.feeRate) * 100) / 100;
});

const actualAmount = computed(() => {
  const amount = Number(form.amount) || 0;
  return Math.round(Math.max(amount - fee.value, 0) * 100) / 100;
});

const kycPassed = computed(() => userStore.userInfo?.kycStatus === 'passed');

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/mine');
  }
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
    if (cfg.methods.length) form.method = cfg.methods[0];
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

  const amount = Number(form.amount);
  if (!amount || amount <= 0) {
    showToast('请输入提现金额');
    return;
  }
  if (config.value && amount < config.value.min) {
    showToast(`最低提现 ${config.value.min} 元`);
    return;
  }
  if (amount > balance.value) {
    showToast('提现金余额不足');
    return;
  }

  let accountInfo: Record<string, string>;
  if (form.method === 'bank') {
    accountInfo = {
      accountName: form.accountName.trim(),
      bankName: form.bankName.trim(),
      cardNo: form.cardNo.trim(),
    };
    if (!accountInfo.accountName || !accountInfo.bankName || !accountInfo.cardNo) {
      showToast('请填写完整银行卡信息');
      return;
    }
  } else {
    accountInfo = {
      accountName: form.accountName.trim(),
      accountNo: form.accountNo.trim(),
    };
    if (!accountInfo.accountName || !accountInfo.accountNo) {
      showToast('请填写完整收款账户');
      return;
    }
  }

  await showConfirmDialog({
    title: '确认提现',
    message: `提现 ${amount} 元，手续费 ${fee.value} 元，预计到账 ${actualAmount.value} 元`,
  });

  submitting.value = true;
  try {
    await applyWithdraw({ amount, method: form.method, accountInfo });
    showToast('提现申请已提交');
    form.amount = '';
    await fundStore.fetchAccount();
    router.push('/withdraw/records');
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="提现" left-arrow @click-left="goBack">
      <template #right>
        <span class="nav-link" @click="router.push('/withdraw/records')">记录</span>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />

    <template v-else>
      <van-notice-bar
        v-if="!kycPassed"
        left-icon="info-o"
        text="提现前需完成实名认证"
        @click="router.push('/kyc')"
      />

      <div class="balance-card">
        <span>可提现余额（提现金）</span>
        <b>¥ {{ balance.toFixed(2) }}</b>
      </div>

      <van-cell-group inset>
        <van-field
          v-model="form.amount"
          type="number"
          label="提现金额"
          placeholder="请输入提现金额"
        />
        <van-cell title="手续费" :value="`¥ ${fee.toFixed(2)}`" />
        <van-cell title="预计到账" :value="`¥ ${actualAmount.toFixed(2)}`" />
      </van-cell-group>

      <van-radio-group v-model="form.method" style="margin-top: 12px">
        <van-cell-group inset title="提现方式">
          <van-cell
            v-if="config?.methods.includes('wechat')"
            title="微信"
            clickable
            @click="form.method = 'wechat'"
          >
            <template #right-icon><van-radio name="wechat" /></template>
          </van-cell>
          <van-cell
            v-if="config?.methods.includes('alipay')"
            title="支付宝"
            clickable
            @click="form.method = 'alipay'"
          >
            <template #right-icon><van-radio name="alipay" /></template>
          </van-cell>
          <van-cell
            v-if="config?.methods.includes('bank')"
            title="银行卡"
            clickable
            @click="form.method = 'bank'"
          >
            <template #right-icon><van-radio name="bank" /></template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>

      <van-cell-group inset title="收款账户" style="margin-top: 12px">
        <van-field v-model="form.accountName" label="姓名" placeholder="收款人姓名" />
        <template v-if="form.method === 'bank'">
          <van-field v-model="form.bankName" label="开户行" placeholder="如：招商银行" />
          <van-field v-model="form.cardNo" label="卡号" placeholder="银行卡号" />
        </template>
        <van-field
          v-else
          v-model="form.accountNo"
          :label="form.method === 'wechat' ? '微信号' : '支付宝账号'"
          placeholder="收款账号"
        />
      </van-cell-group>

      <div class="submit">
        <van-button round block type="primary" :loading="submitting" @click="onSubmit">
          申请提现
        </van-button>
      </div>

      <van-notice-bar
        wrapable
        :scrollable="false"
        text="说明：仅提现金可提现，可用贡献金仅限站内消费。"
      />
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.nav-link {
  font-size: 14px;
  color: #1989fa;
}
.balance-card {
  margin: 12px 16px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6034, #ee0a24);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.balance-card b {
  font-size: 28px;
}
.submit {
  padding: 24px 16px 12px;
}
</style>
