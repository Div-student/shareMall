<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchProfile } from '@/api/user';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useCartStore } from '@/stores/cart';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const fundStore = useFundStore();
const cartStore = useCartStore();

const loading = ref(true);
const nickname = ref('');
const phone = ref('');
const avatar = ref('');
const kycStatus = ref('none');
const cacheSize = ref('0MB');
const clearingCache = ref(false);
const cacheCleared = ref(false);
const logoutConfirming = ref(false);
const loggingOut = ref(false);
let logoutTimer: ReturnType<typeof setTimeout> | null = null;

const avatarText = computed(() => {
  const name = nickname.value.trim();
  if (name && name !== '未设置') return name.slice(0, 1);
  return phone.value?.slice(-1) ?? 'U';
});

const maskedPhone = computed(() => {
  if (!phone.value || phone.value.length !== 11) return phone.value;
  return `${phone.value.slice(0, 3)}****${phone.value.slice(7)}`;
});

const kycTag = computed(() => {
  if (kycStatus.value === 'passed') return { label: '已认证', class: 'tag-success' };
  if (kycStatus.value === 'pending') return { label: '审核中', class: 'tag-warn' };
  if (kycStatus.value === 'rejected') return { label: '已驳回', class: 'tag-danger' };
  return { label: '未认证', class: '' };
});

function estimateCacheSize() {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    bytes += key.length + (localStorage.getItem(key)?.length ?? 0);
  }
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    bytes += key.length + (sessionStorage.getItem(key)?.length ?? 0);
  }
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function refreshCacheSize() {
  cacheSize.value = estimateCacheSize();
}

async function load(silent = false) {
  if (!userStore.isLoggedIn || loggingOut.value) {
    if (!silent) loading.value = false;
    return;
  }
  if (!silent) loading.value = true;
  try {
    const profile = await fetchProfile();
    if (!userStore.isLoggedIn || loggingOut.value) return;
    nickname.value = profile.nickname || '未设置';
    phone.value = profile.phone;
    avatar.value = profile.avatar || '';
    kycStatus.value = profile.kycStatus;
    userStore.patchUserInfo({
      nickname: profile.nickname || null,
      avatar: profile.avatar || null,
      kycStatus: profile.kycStatus,
    });
  } catch {
    /* 401 等错误由拦截器处理 */
  } finally {
    loading.value = false;
    refreshCacheSize();
  }
}

function goProfileEdit() {
  router.push('/mine/profile/edit');
}

function goAccountSecurity() {
  router.push('/reset-password');
}

function goKyc() {
  router.push('/kyc');
}

async function clearCache() {
  if (clearingCache.value || cacheCleared.value) return;
  clearingCache.value = true;
  await new Promise((r) => setTimeout(r, 800));
  const keepKeys = ['token', 'userInfo'];
  Object.keys(localStorage).forEach((key) => {
    if (!keepKeys.includes(key)) localStorage.removeItem(key);
  });
  sessionStorage.clear();
  cacheSize.value = '0MB';
  cacheCleared.value = true;
  clearingCache.value = false;
  showToast('缓存已清除');
}

async function handleLogout() {
  if (!logoutConfirming.value) {
    logoutConfirming.value = true;
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logoutConfirming.value = false;
    }, 3000);
    return;
  }

  if (loggingOut.value) return;

  loggingOut.value = true;
  if (logoutTimer) clearTimeout(logoutTimer);
  logoutConfirming.value = false;

  userStore.logout();
  fundStore.reset();
  cartStore.reset();

  nickname.value = '';
  phone.value = '';
  avatar.value = '';

  showToast('已退出登录');
  try {
    await router.replace('/mine');
  } finally {
    loggingOut.value = false;
  }
}

function onDeleteAccount() {
  showToast('请联系客服注销账号');
}

onMounted(() => load(false));
onActivated(() => load(true));
</script>

<template>
  <div class="page-shop settings-page">
    <SmAppHeader title="设置" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body settings-body">
      <div class="page-content">
        <div class="settings-section settings-section-top">
          <button type="button" class="settings-row" @click="goProfileEdit">
            <div class="settings-row-icon settings-row-icon-avatar">
              <img v-if="avatar" :src="avatar" alt="" class="settings-row-avatar-img">
              <span v-else>{{ avatarText }}</span>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">{{ nickname }}</div>
              <div class="settings-row-subtitle">{{ maskedPhone }}</div>
            </div>
            <div class="settings-row-right">
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>

        <div class="settings-section">
          <button type="button" class="settings-row" @click="goAccountSecurity">
            <div class="settings-row-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">账号安全</div>
              <div class="settings-row-subtitle">修改密码、绑定手机</div>
            </div>
            <div class="settings-row-right">
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <button type="button" class="settings-row" @click="goKyc">
            <div class="settings-row-icon settings-row-icon-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">实名认证</div>
            </div>
            <div class="settings-row-right">
              <span v-if="kycTag.class" class="tag" :class="kycTag.class">{{ kycTag.label }}</span>
              <span v-else class="settings-row-value">{{ kycTag.label }}</span>
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <div class="settings-row settings-row-static">
            <div class="settings-row-icon settings-row-icon-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">清除缓存</div>
            </div>
            <div class="settings-row-right">
              <span class="settings-row-value">{{ cacheSize }}</span>
              <button
                type="button"
                class="cache-btn"
                :disabled="clearingCache || cacheCleared"
                @click="clearCache"
              >
                {{ clearingCache ? '清除中...' : cacheCleared ? '已清除' : '清除' }}
              </button>
            </div>
          </div>

          <button type="button" class="settings-row" @click="showToast('shareMall — 贡献金商城')">
            <div class="settings-row-icon settings-row-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">关于我们</div>
            </div>
            <div class="settings-row-right">
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <button type="button" class="settings-row" @click="router.push('/agreement/user')">
            <div class="settings-row-icon settings-row-icon-warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">用户协议</div>
            </div>
            <div class="settings-row-right">
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <button type="button" class="settings-row" @click="router.push('/agreement/privacy')">
            <div class="settings-row-icon settings-row-icon-purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1" />
              </svg>
            </div>
            <div class="settings-row-content">
              <div class="settings-row-title">隐私政策</div>
            </div>
            <div class="settings-row-right">
              <svg class="settings-row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>

        <button
          type="button"
          class="logout-btn"
          :class="{ confirming: logoutConfirming }"
          @click="handleLogout"
        >
          {{ logoutConfirming ? '再次点击确认退出' : '退出登录' }}
        </button>

        <button type="button" class="delete-account-link" @click="onDeleteAccount">
          注销账号
        </button>
      </div>
    </main>
  </div>
</template>
