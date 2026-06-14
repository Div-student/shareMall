<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchTradeRecords, type TradeRecordItem } from '@/api/nft';

const router = useRouter();
const loading = ref(true);
const list = ref<TradeRecordItem[]>([]);
const filter = ref<'all' | 'buy' | 'sell'>('all');

const roleText = { buy: '买入', sell: '卖出' } as const;

async function load() {
  loading.value = true;
  try {
    const res = await fetchTradeRecords({ page: 1, pageSize: 50, type: filter.value });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="藏品交易记录" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="filter" @change="load">
      <van-tab title="全部" name="all" />
      <van-tab title="买入" name="buy" />
      <van-tab title="卖出" name="sell" />
    </van-tabs>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!list.length" description="暂无交易记录" />

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="card">
        <van-image width="64" height="64" fit="cover" :src="item.cover" />
        <div class="info">
          <div class="name">{{ item.nftName }}</div>
          <div class="serial">编号 {{ item.serialNo }}</div>
          <van-tag plain :type="item.role === 'buy' ? 'primary' : 'success'">
            {{ roleText[item.role] }}
          </van-tag>
          <div class="price">成交价 {{ item.price }} · 参考价 {{ item.referencePrice }}</div>
          <div v-if="item.role === 'sell'" class="sub">到账提现金 {{ item.sellerIncome }}（手续费 {{ item.fee }}）</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  gap: 6px;
}
.name {
  font-weight: 600;
}
.serial,
.price,
.sub {
  color: #646566;
  font-size: 13px;
}
</style>
