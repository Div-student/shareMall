<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMyNfts, type UserNftItem } from '@/api/nft';

const router = useRouter();
const loading = ref(true);
const list = ref<UserNftItem[]>([]);

const statusMap: Record<UserNftItem['status'], string> = {
  holding: '持有中',
  listed: '挂单中',
  sold: '已售出',
  transferred: '已转赠',
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchMyNfts({ page: 1, pageSize: 50 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的数字藏品" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-link" @click="router.push('/nft/trade')">二级市场</span>
      </template>
    </van-nav-bar>

    <div class="toolbar">
      <van-button size="small" plain @click="router.push('/nft/market')">去兑换</van-button>
      <van-button size="small" plain @click="router.push('/nft/listings')">我的挂单</van-button>
    </div>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!list.length" description="暂无藏品，去商城兑换吧">
      <van-button type="primary" round @click="router.push('/nft/market')">藏品商城</van-button>
    </van-empty>

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="card" @click="router.push(`/nft/mine/${item.id}`)">
        <van-image width="88" height="88" fit="cover" :src="item.cover" />
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="serial">编号 {{ item.serialNo }}</div>
          <div class="meta">
            <van-tag plain type="primary">{{ statusMap[item.status] }}</van-tag>
            <span class="time">{{ new Date(item.acquiredAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  color: #1989fa;
  font-size: 14px;
}
.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
}
.card {
  cursor: pointer;
}
.list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.name {
  font-weight: 600;
  font-size: 15px;
}
.serial {
  color: #646566;
  font-size: 13px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time {
  color: #969799;
  font-size: 12px;
}
</style>
