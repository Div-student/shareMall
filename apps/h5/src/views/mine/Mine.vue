<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { fetchOrders } from '@/api/order';
import { fetchUnreadCount } from '@/api/message';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const ORDERS_TAB_KEY = 'ordersTab';

const router = useRouter();
const userStore = useUserStore();
const fundStore = useFundStore();
const { userInfo, isLoggedIn } = storeToRefs(userStore);
const { account } = storeToRefs(fundStore);
const unreadCount = ref(0);

const statusCounts = ref({ unpaid: 0, paid: 0, shipped: 0 });

const displayName = computed(() => {
  if (!isLoggedIn.value) return '点击登录';
  return userInfo.value?.nickname || 'shareMall 用户';
});

const avatarText = computed(() => {
  if (!isLoggedIn.value) return '访';
  const name = userInfo.value?.nickname?.trim();
  if (name) return name.slice(0, 1).toUpperCase();
  return userInfo.value?.phone?.slice(-1) ?? 'U';
});

const maskedPhone = computed(() => {
  if (!isLoggedIn.value) return '登录后享受更多服务';
  return maskPhone(userInfo.value?.phone);
});

const kycPassed = computed(() => userInfo.value?.kycStatus === 'passed');

const kycLabel = computed(() => {
  const status = userInfo.value?.kycStatus ?? 'none';
  if (status === 'passed') return '已实名认证';
  if (status === 'pending') return '实名审核中';
  if (status === 'rejected') return '实名已驳回';
  return '未实名认证';
});

function maskPhone(phone?: string) {
  if (!phone || phone.length !== 11) return phone ?? '';
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBadge(n: number) {
  if (n <= 0) return '';
  return n > 99 ? '99+' : String(n);
}

function requireLogin(fn: () => void) {
  if (!isLoggedIn.value) {
    goLogin();
    return;
  }
  fn();
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: '/mine' } });
}

function goProfile() {
  requireLogin(() => router.push('/mine/profile'));
}

function onVerifyTagClick() {
  if (!isLoggedIn.value) {
    goLogin();
    return;
  }
  if (kycPassed.value) {
    showToast('已通过实名认证');
    return;
  }
  router.push('/kyc');
}

function goOrders(status?: string) {
  if (status) sessionStorage.setItem(ORDERS_TAB_KEY, status);
  router.push('/orders');
}

async function loadStatusCounts() {
  if (!isLoggedIn.value) {
    statusCounts.value = { unpaid: 0, paid: 0, shipped: 0 };
    return;
  }
  const statuses = ['unpaid', 'paid', 'shipped'] as const;
  const results = await Promise.all(
    statuses.map((status) => fetchOrders({ status, page: 1 }).catch(() => ({ total: 0, list: [] }))),
  );
  statusCounts.value = {
    unpaid: results[0].total,
    paid: results[1].total,
    shipped: results[2].total,
  };
}

async function refreshMine() {
  if (!isLoggedIn.value) {
    unreadCount.value = 0;
    statusCounts.value = { unpaid: 0, paid: 0, shipped: 0 };
    return;
  }
  await Promise.all([
    userStore.refreshProfile(),
    fundStore.fetchAccount(),
    loadStatusCounts(),
    fetchUnreadCount()
      .then((res) => {
        unreadCount.value = res.count;
      })
      .catch(() => {
        unreadCount.value = 0;
      }),
  ]);
}

onMounted(refreshMine);
onActivated(refreshMine);
</script>

<template>
  <div class="page-shop profile-page has-tabbar">
    <div class="page-scroll-area">
      <div class="profile-hero">
        <div class="user-card">
          <button type="button" class="avatar-lg" @click="isLoggedIn ? goProfile() : goLogin()">
            <img v-if="userInfo?.avatar" :src="userInfo.avatar" alt="" class="avatar-img" />
            <span v-else>{{ avatarText }}</span>
          </button>
          <div class="user-info" @click="isLoggedIn ? goProfile() : goLogin()">
            <div class="user-nickname">{{ displayName }}</div>
            <div class="user-phone">{{ maskedPhone }}</div>
            <button
              v-if="isLoggedIn"
              type="button"
              class="user-verify-tag"
              :class="{ verified: kycPassed }"
              @click.stop="onVerifyTagClick"
            >
              <svg
                v-if="kycPassed"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {{ kycLabel }}
            </button>
          </div>
          <button type="button" class="settings-link" aria-label="设置" @click="goProfile">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="assets-card">
        <div class="assets-row">
          <button
            type="button"
            class="asset-item"
            @click="requireLogin(() => router.push('/fund'))"
          >
            <span class="asset-label">可用贡献金</span>
            <span class="asset-value accent">
              <span class="yuan">¥</span>{{ formatMoney(account?.availableFund ?? 0) }}
            </span>
          </button>
          <button
            type="button"
            class="asset-item"
            @click="requireLogin(() => router.push('/withdraw'))"
          >
            <span class="asset-label">提现金</span>
            <span class="asset-value success">
              <span class="yuan">¥</span>{{ formatMoney(account?.withdrawableCash ?? 0) }}
            </span>
          </button>
          <button type="button" class="asset-item" @click="requireLogin(() => router.push('/fund'))">
            <span class="asset-label">待兑现贡献金</span>
            <span class="asset-value">
              <span class="yuan">¥</span>{{ formatMoney(account?.pendingFund ?? 0) }}
            </span>
          </button>
        </div>
      </div>

      <div class="order-quick-card">
        <div class="order-quick-header">
          <h4>我的订单</h4>
          <button type="button" class="order-all-link" @click="goOrders()">
            全部订单
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div class="order-quick-row">
          <button type="button" class="order-quick-item" @click="requireLogin(() => goOrders('unpaid'))">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <span>待付款</span>
            <span v-if="formatBadge(statusCounts.unpaid)" class="order-badge">{{ formatBadge(statusCounts.unpaid) }}</span>
          </button>
          <button type="button" class="order-quick-item" @click="requireLogin(() => goOrders('paid'))">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 16h6v-6l-3-3H16M16 8h-2V2H6v6H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v4h6v-4h4l2-2v-4z" />
            </svg>
            <span>待发货</span>
            <span v-if="formatBadge(statusCounts.paid)" class="order-badge">{{ formatBadge(statusCounts.paid) }}</span>
          </button>
          <button type="button" class="order-quick-item" @click="requireLogin(() => goOrders('shipped'))">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>待收货</span>
            <span v-if="formatBadge(statusCounts.shipped)" class="order-badge">{{ formatBadge(statusCounts.shipped) }}</span>
          </button>
          <button type="button" class="order-quick-item" @click="requireLogin(() => router.push('/aftersale'))">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>售后</span>
          </button>
        </div>
      </div>

      <div class="func-grid">
        <div class="func-grid-title">常用功能</div>
        <div class="func-grid-row">
          <button type="button" class="func-item" @click="requireLogin(() => router.push('/tasks'))">
            <div class="func-icon func-icon-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span>任务中心</span>
          </button>
          <button type="button" class="func-item" @click="goOrders()">
            <div class="func-icon func-icon-warn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </div>
            <span>我的订单</span>
          </button>
          <button type="button" class="func-item" @click="router.push('/nft/market')">
            <div class="func-icon func-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <span>数字藏品</span>
          </button>
          <button type="button" class="func-item" @click="requireLogin(() => router.push('/nft/mine'))">
            <div class="func-icon func-icon-gem">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 3h12l4 6-10 13L2 9z" />
              </svg>
            </div>
            <span>我的藏品</span>
          </button>
          <button type="button" class="func-item" @click="requireLogin(() => router.push('/mine/coupons'))">
            <div class="func-icon func-icon-orange">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                <path d="M2 8h20v4H2z" />
                <path d="M12 2v4" />
              </svg>
            </div>
            <span>优惠券</span>
          </button>
          <button type="button" class="func-item" @click="router.push('/mine/address')">
            <div class="func-icon func-icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span>收货地址</span>
          </button>
          <button type="button" class="func-item" @click="requireLogin(() => router.push('/mine/invite'))">
            <div class="func-icon func-icon-success">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span>我的邀请</span>
          </button>
          <button type="button" class="func-item" @click="requireLogin(() => router.push('/messages'))">
            <div class="func-icon func-icon-danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span>消息通知</span>
            <span v-if="unreadCount > 0" class="func-unread-dot" />
          </button>
          <button type="button" class="func-item" @click="goProfile">
            <div class="func-icon func-icon-muted">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </div>
            <span>设置</span>
          </button>
        </div>
      </div>

      <div style="height: var(--space-6)" />
    </div>
  </div>
</template>
