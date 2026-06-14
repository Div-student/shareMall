<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';
import { fetchUnreadCount } from '@/api/message';

const router = useRouter();
const userStore = useUserStore();
const fundStore = useFundStore();
const cartStore = useCartStore();
const { userInfo, isLoggedIn } = storeToRefs(userStore);
const { account } = storeToRefs(fundStore);
const unreadCount = ref(0);

const displayName = computed(() => {
  if (!isLoggedIn.value) return '未登录';
  return userInfo.value?.nickname || maskPhone(userInfo.value?.phone);
});

const kycText: Record<string, string> = {
  none: '未认证',
  pending: '审核中',
  passed: '已认证',
  rejected: '已驳回',
};

const kycStatusLabel = computed(() => {
  const status = userInfo.value?.kycStatus ?? 'none';
  return kycText[status] ?? '未认证';
});

function goKyc() {
  if (!isLoggedIn.value) {
    goLogin();
    return;
  }
  router.push('/kyc');
}

function maskPhone(phone?: string) {
  if (!phone || phone.length !== 11) return phone ?? '';
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: '/mine' } });
}

function logout() {
  userStore.logout();
  fundStore.reset();
  cartStore.reset();
}

onMounted(refreshMine);
onActivated(refreshMine);

async function refreshMine() {
  if (!isLoggedIn.value) return;
  await Promise.all([
    userStore.refreshProfile(),
    fundStore.fetchAccount(),
    fetchUnreadCount().then((res) => {
      unreadCount.value = res.count;
    }).catch(() => {
      unreadCount.value = 0;
    }),
  ]);
}
</script>

<template>
  <div class="page">
    <div class="header">
      <van-image round width="56" height="56" :src="userInfo?.avatar || undefined" />
      <div class="info">
        <div class="name">{{ displayName }}</div>
        <div v-if="!isLoggedIn" class="login" @click="goLogin">点击登录 / 注册</div>
        <div v-else class="login">邀请码：{{ userInfo?.inviteCode }}</div>
        <div v-if="isLoggedIn" class="kyc" @click="goKyc">实名状态：{{ kycStatusLabel }}</div>
      </div>
      <van-button v-if="isLoggedIn" size="small" plain @click="logout">退出</van-button>
    </div>

    <div class="assets">
      <div class="asset">
        <b>{{ account?.availableFund ?? 0 }}</b>
        <span>可用贡献金</span>
      </div>
      <div class="asset" @click="isLoggedIn ? router.push('/withdraw') : goLogin()">
        <b>{{ account?.withdrawableCash ?? 0 }}</b>
        <span>提现金</span>
      </div>
    </div>

    <van-grid :column-num="4">
      <van-grid-item icon="todo-list-o" text="任务中心" @click="isLoggedIn ? router.push('/tasks') : goLogin()" />
      <van-grid-item icon="orders-o" text="我的订单" @click="router.push('/orders')" />
      <van-grid-item icon="diamond-o" text="数字藏品" @click="router.push('/nft/market')" />
      <van-grid-item icon="contact" text="基本信息" @click="router.push('/mine/profile')" />
    </van-grid>

    <van-cell-group inset>
      <van-cell title="消息通知" is-link :value="unreadCount > 0 ? `${unreadCount}条未读` : ''" @click="isLoggedIn ? router.push('/messages') : goLogin()" />
      <van-cell title="实名认证" is-link :value="kycStatusLabel" @click="goKyc" />
      <van-cell title="收货地址" is-link @click="router.push('/mine/address')" />
      <van-cell title="我的邀请" is-link @click="isLoggedIn ? router.push('/mine/invite') : goLogin()" />
      <van-cell title="我的优惠券" is-link @click="isLoggedIn ? router.push('/mine/coupons') : goLogin()" />
      <van-cell title="帮助与客服" is-link @click="router.push('/support')" />
      <van-cell title="设置" is-link />
    </van-cell-group>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #fff;
}
.info {
  flex: 1;
}
.name {
  font-size: 18px;
  font-weight: 600;
}
.login {
  font-size: 13px;
  color: #969799;
}
.kyc {
  margin-top: 4px;
  font-size: 12px;
  color: #1989fa;
}
.assets {
  display: flex;
  background: #fff;
  margin-bottom: 12px;
}
.asset {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
}
.asset b {
  font-size: 18px;
  color: #ee0a24;
}
.asset span {
  font-size: 12px;
  color: #969799;
}
</style>
