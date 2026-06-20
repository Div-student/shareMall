<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { OrderDetail } from '@sharemall/shared';
import { fetchFundAccount } from '@/api/fund';
import { fetchOrderDetail, payOrder } from '@/api/order';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

type PayChannel = 'wechat' | 'alipay' | 'balance';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;
const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const paying = ref(false);
const processing = ref(false);
const payChannel = ref<PayChannel>('wechat');
const summaryOpen = ref(false);
const showLeaveDialog = ref(false);
const balance = ref(0);
const remainSeconds = ref(30 * 60);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const payAmount = computed(() => order.value?.payAmount ?? 0);
const itemCount = computed(() => order.value?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0);
const fundDeductAmount = computed(() => order.value?.fundDeductAmount ?? 0);
const couponAmount = computed(() => order.value?.couponAmount ?? 0);
const balanceInsufficient = computed(() => balance.value < payAmount.value);

const countdownText = computed(() => {
  const m = Math.floor(remainSeconds.value / 60);
  const s = remainSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const isUrgent = computed(() => remainSeconds.value > 0 && remainSeconds.value < 5 * 60);
const payDisabled = computed(() => paying.value || remainSeconds.value <= 0 || payChannel.value === 'balance');

function formatMoney(value: number) {
  return value.toFixed(2);
}

function startCountdown() {
  if (!order.value?.createdAt) return;
  const expireAt = new Date(order.value.createdAt).getTime() + 30 * 60 * 1000;
  const tick = () => {
    const left = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
    remainSeconds.value = left;
    if (left <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function selectMethod(channel: PayChannel) {
  if (channel === 'balance' && balanceInsufficient.value) return;
  payChannel.value = channel;
}

function onBack() {
  showLeaveDialog.value = true;
}

function stayOnPay() {
  showLeaveDialog.value = false;
}

function leavePay() {
  showLeaveDialog.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  router.back();
}

async function loadOrder() {
  try {
    const [detail, fund] = await Promise.all([
      fetchOrderDetail(orderId),
      fetchFundAccount().catch(() => ({ withdrawableCash: 0 })),
    ]);
    order.value = detail;
    balance.value = fund.withdrawableCash ?? 0;
    startCountdown();
  } finally {
    loading.value = false;
  }
}

async function doPay() {
  if (payDisabled.value || payChannel.value === 'balance') return;
  paying.value = true;
  processing.value = true;
  try {
    const channel = payChannel.value;
    const result = await payOrder(orderId, channel);
    await new Promise((r) => setTimeout(r, 800));
    router.replace({
      path: `/order/result/${orderId}`,
      query: {
        accruedFund: String(result.accruedFund),
        channel,
      },
    });
  } finally {
    paying.value = false;
    processing.value = false;
  }
}

onMounted(loadOrder);
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <div class="page-shop payment-page has-action-bar">
    <SmAppHeader title="收银台" @back="onBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else-if="order">
      <main class="page-body with-action-bar">
        <section class="payment-amount">
          <p class="amount-label">需支付金额</p>
          <p class="amount-value">
            <span class="yuan-sign">¥</span>{{ formatMoney(payAmount) }}
          </p>
        </section>

        <section class="countdown-bar" :class="{ warn: isUrgent || remainSeconds <= 0 }">
          <template v-if="remainSeconds > 0">
            请在 <span class="countdown-time">{{ countdownText }}</span> 内完成支付
          </template>
          <template v-else>支付已超时，请重新下单</template>
        </section>

        <section class="payment-methods">
          <p class="section-title">选择支付方式</p>
          <div class="method-list">
            <button
              type="button"
              class="option-row"
              :class="{ selected: payChannel === 'wechat' }"
              @click="selectMethod('wechat')"
            >
              <span class="radio-circle" aria-hidden="true" />
              <span class="method-icon wechat">微</span>
              <span class="method-info">
                <span class="method-name">微信支付</span>
              </span>
            </button>

            <button
              type="button"
              class="option-row"
              :class="{ selected: payChannel === 'alipay' }"
              @click="selectMethod('alipay')"
            >
              <span class="radio-circle" aria-hidden="true" />
              <span class="method-icon alipay">支</span>
              <span class="method-info">
                <span class="method-name">支付宝</span>
              </span>
            </button>

            <button
              type="button"
              class="option-row"
              :class="{ disabled: balanceInsufficient, selected: payChannel === 'balance' && !balanceInsufficient }"
              :disabled="balanceInsufficient"
              @click="selectMethod('balance')"
            >
              <span class="radio-circle" aria-hidden="true" />
              <span class="method-icon balance">余</span>
              <span class="method-info">
                <span class="method-name">余额支付</span>
                <span class="method-desc">余额 ¥{{ formatMoney(balance) }}</span>
              </span>
              <span v-if="balanceInsufficient" class="tag tag-danger">余额不足</span>
            </button>
          </div>
        </section>

        <section class="order-summary" :class="{ expanded: summaryOpen }">
          <button type="button" class="summary-toggle" @click="summaryOpen = !summaryOpen">
            <span>订单详情</span>
            <svg class="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <div class="summary-body">
            <div class="summary-row">
              <span class="row-label">商品{{ itemCount }}件</span>
              <span class="row-value">¥{{ formatMoney(order.totalAmount) }}</span>
            </div>
            <div v-if="fundDeductAmount > 0" class="summary-row">
              <span class="row-label">贡献金抵扣</span>
              <span class="row-value deduction">-¥{{ formatMoney(fundDeductAmount) }}</span>
            </div>
            <div v-if="couponAmount > 0" class="summary-row">
              <span class="row-label">优惠券抵扣</span>
              <span class="row-value deduction">-¥{{ formatMoney(couponAmount) }}</span>
            </div>
          </div>
        </section>

        <section class="security-note">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1L2 4v4c0 3.5 2.6 6.8 6 7.5 3.4-.7 6-4 6-7.5V4L8 1z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
            <path
              d="M6 8l1.5 1.5L10 7"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>支付由银联/微信/支付宝提供安全保障</span>
        </section>
      </main>

      <div class="action-bar confirm-bar at-bottom">
        <button type="button" class="btn-confirm" :disabled="payDisabled" @click="doPay">
          确认支付 <span class="confirm-amount">¥{{ formatMoney(payAmount) }}</span>
        </button>
      </div>

      <div
        class="confirm-dialog-overlay"
        :class="{ active: showLeaveDialog }"
        @click.self="stayOnPay"
      >
        <div class="confirm-dialog">
          <p class="dialog-title">确定放弃支付？</p>
          <p class="dialog-desc">订单将保留一段时间，超时后可能被取消</p>
          <div class="dialog-actions">
            <button type="button" class="btn-cancel" @click="stayOnPay">继续支付</button>
            <button type="button" class="btn-leave" @click="leavePay">确定离开</button>
          </div>
        </div>
      </div>

      <div class="processing-overlay" :class="{ active: processing }">
        <div class="processing-box">
          <div class="spinner" />
          <p class="processing-text">支付处理中…</p>
        </div>
      </div>
    </template>
  </div>
</template>
