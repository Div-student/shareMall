<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import {
  claimCoupon,
  fetchClaimableCoupons,
  fetchMyCoupons,
  type ClaimableCoupon,
  type UserCouponItem,
} from '@/api/operations';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

type CouponTab = 'claimable' | 'usable' | 'used' | 'expired';

interface DisplayCoupon {
  key: string;
  tab: CouponTab;
  name: string;
  type: 'fixed' | 'discount';
  value: number;
  minAmount: number;
  endAt: string | null;
  status?: UserCouponItem['status'];
  usedAt?: string | null;
  couponId: number;
  userCouponId?: number;
}

const TABS: { key: CouponTab; label: string }[] = [
  { key: 'claimable', label: '可领取' },
  { key: 'usable', label: '未使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
];

const router = useRouter();
const activeTab = ref<CouponTab>('claimable');
const loading = ref(true);
const claimingId = ref<number | null>(null);
const claimable = ref<ClaimableCoupon[]>([]);
const mine = ref<UserCouponItem[]>([]);

const allCoupons = computed<DisplayCoupon[]>(() => {
  const list: DisplayCoupon[] = [];

  claimable.value.forEach((item) => {
    if (item.claimed) return;
    list.push({
      key: `claim-${item.id}`,
      tab: 'claimable',
      name: item.name,
      type: item.type,
      value: item.value,
      minAmount: item.minAmount,
      endAt: item.endAt,
      couponId: item.id,
    });
  });

  mine.value.forEach((item) => {
    const coupon = item.coupon;
    if (!coupon) return;

    const endAt = coupon.endAt ?? null;
    const expiredByDate = endAt ? new Date(endAt).getTime() < Date.now() : false;
    let tab: CouponTab = 'usable';

    if (item.status === 'used') {
      tab = 'used';
    } else if (item.status === 'expired' || (item.status === 'unused' && expiredByDate)) {
      tab = 'expired';
    }

    list.push({
      key: `mine-${item.id}`,
      tab,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      minAmount: coupon.minAmount,
      endAt,
      status: item.status,
      usedAt: item.usedAt ?? null,
      couponId: coupon.id,
      userCouponId: item.id,
    });
  });

  return list;
});

const filteredCoupons = computed(() =>
  allCoupons.value.filter((item) => item.tab === activeTab.value),
);

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(0);
}

function couponDisplayValue(item: Pick<DisplayCoupon, 'type' | 'value'>) {
  if (item.type === 'discount') {
    return { symbol: '', val: `${Math.round(item.value * 100) / 10}折` };
  }
  return { symbol: '¥', val: formatAmount(item.value) };
}

function conditionText(minAmount: number) {
  if (minAmount <= 0) return '无门槛';
  return `满${formatAmount(minAmount)}可用`;
}

function formatDateDot(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function formatDateDash(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function expiryText(item: DisplayCoupon) {
  if (item.tab === 'used') {
    const date = item.usedAt ? formatDateDash(item.usedAt) : '';
    return date ? `已使用 · ${date}` : '已使用';
  }
  if (item.tab === 'expired') {
    const date = item.endAt ? formatDateDash(item.endAt) : '';
    return date ? `已过期 · ${date}` : '已过期';
  }
  if (item.endAt) return `${formatDateDot(item.endAt)}到期`;
  return '';
}

function cardClass(item: DisplayCoupon) {
  return {
    claimable: item.tab === 'claimable',
    usable: item.tab === 'usable',
    expired: item.tab === 'expired',
    used: item.tab === 'used',
  };
}

async function load() {
  loading.value = true;
  try {
    const [claimRes, mineRes] = await Promise.all([fetchClaimableCoupons(), fetchMyCoupons()]);
    claimable.value = claimRes.list;
    mine.value = mineRes.list;
  } finally {
    loading.value = false;
  }
}

async function onClaim(couponId: number) {
  if (claimingId.value != null) return;
  claimingId.value = couponId;
  try {
    await claimCoupon(couponId);
    showToast('领取成功');
    activeTab.value = 'usable';
    await load();
  } finally {
    claimingId.value = null;
  }
}

function onUse() {
  showToast('前往商品页使用');
  router.push('/home');
}

onMounted(load);
</script>

<template>
  <div class="page-shop coupons-page">
    <SmAppHeader title="我的优惠券" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body coupons-body">
      <div class="page-content">
        <div class="tab-filter">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="filteredCoupons.length" class="coupon-list">
          <article
            v-for="item in filteredCoupons"
            :key="item.key"
            class="coupon-card"
            :class="cardClass(item)"
          >
            <div class="coupon-amount-circle">
              <span v-if="couponDisplayValue(item).symbol" class="coupon-symbol">
                {{ couponDisplayValue(item).symbol }}
              </span>
              <span class="coupon-val">{{ couponDisplayValue(item).val }}</span>
            </div>
            <div class="coupon-detail">
              <div class="coupon-name">{{ item.name }}</div>
              <div class="coupon-condition">{{ conditionText(item.minAmount) }}</div>
              <div class="coupon-expiry">{{ expiryText(item) }}</div>
            </div>
            <div class="coupon-action">
              <button
                v-if="item.tab === 'claimable'"
                type="button"
                class="coupon-use-btn btn-claim"
                :disabled="claimingId === item.couponId"
                @click="onClaim(item.couponId)"
              >
                {{ claimingId === item.couponId ? '领取中...' : '领取' }}
              </button>
              <button
                v-else-if="item.tab === 'usable'"
                type="button"
                class="coupon-use-btn btn-use"
                @click="onUse"
              >
                去使用
              </button>
              <button
                v-else-if="item.tab === 'expired'"
                type="button"
                class="coupon-use-btn btn-expired"
                disabled
              >
                已过期
              </button>
              <span v-else class="coupon-status-text">已使用</span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
            <path d="M2 8h20v4H2z" />
            <path d="M12 2v4" />
          </svg>
          <p>暂无优惠券</p>
        </div>
      </div>
    </main>
  </div>
</template>
