<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const fundStore = useFundStore();
const { userInfo, isLoggedIn } = storeToRefs(userStore);
const { account } = storeToRefs(fundStore);

const displayName = computed(() => {
  if (!isLoggedIn.value) return '未登录';
  return userInfo.value?.nickname || maskPhone(userInfo.value?.phone);
});

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
}

onMounted(() => {
  if (isLoggedIn.value) {
    fundStore.fetchAccount();
  }
});
</script>

<template>
  <div class="page">
    <div class="header">
      <van-image round width="56" height="56" :src="userInfo?.avatar || undefined" />
      <div class="info">
        <div class="name">{{ displayName }}</div>
        <div v-if="!isLoggedIn" class="login" @click="goLogin">点击登录 / 注册</div>
        <div v-else class="login">邀请码：{{ userInfo?.inviteCode }}</div>
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
      <van-grid-item icon="todo-list-o" text="任务中心" />
      <van-grid-item icon="orders-o" text="我的订单" @click="router.push('/orders')" />
      <van-grid-item icon="diamond-o" text="数字藏品" />
      <van-grid-item icon="contact" text="基本信息" @click="router.push('/mine/profile')" />
    </van-grid>

    <van-cell-group inset>
      <van-cell title="收货地址" is-link @click="router.push('/mine/address')" />
      <van-cell title="我的邀请" is-link />
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
