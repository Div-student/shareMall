<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { fetchNftMarket, type NftItem } from '@/api/nft';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();
const { account } = storeToRefs(fundStore);
const { isLoggedIn } = storeToRefs(userStore);

const loading = ref(true);
const list = ref<NftItem[]>([]);

async function load() {
  loading.value = true;
  try {
    const res = await fetchNftMarket({ page: 1, pageSize: 50 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function goDetail(id: number) {
  router.push(`/nft/${id}`);
}

function goMine() {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/nft/mine' } });
    return;
  }
  router.push('/nft/mine');
}

onMounted(async () => {
  if (isLoggedIn.value) {
    await fundStore.fetchAccount();
  }
  await load();
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="藏品兑换商城" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-link" @click="router.push('/nft/trade')">二级市场</span>
      </template>
    </van-nav-bar>

    <div class="toolbar">
      <span v-if="isLoggedIn" class="balance-inline">可用贡献金 <b>{{ account?.availableFund ?? 0 }}</b></span>
      <van-button size="small" plain @click="goMine">我的藏品</van-button>
    </div>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!list.length" description="暂无可兑换藏品" />

    <div v-else class="grid">
      <div v-for="item in list" :key="item.id" class="card" @click="goDetail(item.id)">
        <van-image width="100%" height="140" fit="cover" :src="item.cover" />
        <div class="body">
          <div class="name">{{ item.name }}</div>
          <div class="meta">参考价 {{ item.currentPrice }} · 成交 {{ item.dealPriceMin }}~{{ item.dealPriceMax }}</div>
          <div class="stock">剩余 {{ item.stock }} / {{ item.totalSupply }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-inline b {
  color: #ed6a0c;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff7e8;
  font-size: 14px;
}
.balance {
  padding: 12px 16px;
  background: #fff7e8;
  color: #ed6a0c;
  font-size: 14px;
}
.balance b {
  font-size: 18px;
}
.nav-link {
  color: #1989fa;
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}
.card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.body {
  padding: 10px;
}
.name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}
.meta {
  color: #ee0a24;
  font-size: 13px;
}
.stock {
  margin-top: 4px;
  color: #969799;
  font-size: 12px;
}
</style>
