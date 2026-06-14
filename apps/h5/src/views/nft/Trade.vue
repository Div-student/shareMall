<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { buyListing, fetchTradeConfig, fetchTradeMarket, type NftListingItem } from '@/api/nft';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();
const { account } = storeToRefs(fundStore);
const { isLoggedIn } = storeToRefs(userStore);

const loading = ref(true);
const buyingId = ref<number | null>(null);
const enabled = ref(true);
const feeRate = ref(0.05);
const dealPremiumPct = ref(0.1);
const list = ref<NftListingItem[]>([]);

async function load() {
  loading.value = true;
  try {
    const [cfg, market] = await Promise.all([
      fetchTradeConfig(),
      fetchTradeMarket({ page: 1, pageSize: 50 }),
    ]);
    enabled.value = cfg.enabled;
    feeRate.value = cfg.feeRate;
    dealPremiumPct.value = cfg.dealPremiumPct;
    list.value = market.list;
    if (isLoggedIn.value) {
      await fundStore.fetchAccount();
    }
  } finally {
    loading.value = false;
  }
}

async function onBuy(item: NftListingItem) {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/nft/trade' } });
    return;
  }

  if ((account.value?.availableFund ?? 0) < item.dealPriceMax) {
    showToast('可用贡献金不足（需覆盖最高成交价）');
    return;
  }

  await showConfirmDialog({
    title: '确认购买',
    message: `参考价 ${item.referencePrice}，成交价将在 ${item.dealPriceMin} ~ ${item.dealPriceMax} 贡献金范围内随机确定，是否继续？`,
  });

  buyingId.value = item.id;
  try {
    const res = await buyListing(item.id);
    showToast(`购买成功，成交价 ${res.price}`);
    await Promise.all([load(), fundStore.fetchAccount()]);
    router.push('/nft/mine');
  } finally {
    buyingId.value = null;
  }
}

const feePercent = computed(() => `${(feeRate.value * 100).toFixed(1)}%`);

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="二级交易市场" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-link" @click="router.push('/nft/trade/records')">记录</span>
        <span class="nav-link" style="margin-left: 12px" @click="router.push('/nft/listings')">我的挂单</span>
      </template>
    </van-nav-bar>

    <div v-if="isLoggedIn" class="balance">
      可用贡献金：<b>{{ account?.availableFund ?? 0 }}</b>
      <span class="tip">成交溢价最高 {{ (dealPremiumPct * 100).toFixed(0) }}%，手续费 {{ feePercent }}</span>
    </div>

    <van-notice-bar v-if="!enabled" text="二级市场暂未开放" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!list.length" description="暂无在售藏品" />

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="card">
        <van-image width="88" height="88" fit="cover" :src="item.cover" />
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="serial">编号 {{ item.serialNo }}</div>
          <div class="price">参考价 {{ item.referencePrice }} · 成交 {{ item.dealPriceMin }}~{{ item.dealPriceMax }}</div>
          <div class="seller">卖家 {{ item.sellerName }}</div>
        </div>
        <van-button
          size="small"
          type="primary"
          :loading="buyingId === item.id"
          :disabled="!enabled"
          @click="onBuy(item)"
        >
          购买
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance {
  padding: 12px 16px;
  background: #fff7e8;
  color: #ed6a0c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.balance b {
  font-size: 18px;
}
.tip {
  color: #969799;
  font-size: 12px;
}
.nav-link {
  color: #1989fa;
  font-size: 14px;
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
  align-items: center;
}
.info {
  flex: 1;
}
.name {
  font-weight: 600;
  font-size: 15px;
}
.serial,
.seller {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}
.price {
  color: #ee0a24;
  font-size: 13px;
  margin-top: 4px;
  font-weight: 600;
}
</style>
