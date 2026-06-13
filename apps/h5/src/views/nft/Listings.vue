<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { cancelListing, fetchMyListings, refreshListing, type NftListingItem } from '@/api/nft';

const router = useRouter();
const loading = ref(true);
const list = ref<NftListingItem[]>([]);
const refreshingId = ref<number | null>(null);

const statusMap: Record<NftListingItem['status'], string> = {
  listing: '在售',
  sold: '已成交',
  cancelled: '已撤销',
  removed: '已下架',
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchMyListings({ page: 1, pageSize: 50 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function onRefresh(item: NftListingItem) {
  refreshingId.value = item.id;
  try {
    await refreshListing(item.id);
    showToast('已同步当前参考价');
    await load();
  } finally {
    refreshingId.value = null;
  }
}

async function onCancel(item: NftListingItem) {
  await showConfirmDialog({ title: '确认撤单', message: '撤销后藏品将恢复为持有中' });
  await cancelListing(item.id);
  showToast('已撤单');
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的挂单" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-link" @click="router.push('/nft/trade')">去购买</span>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!list.length" description="暂无挂单">
      <van-button type="primary" round @click="router.push('/nft/mine')">去我的藏品</van-button>
    </van-empty>

    <div v-else class="list">
      <div v-for="item in list" :key="item.id" class="card">
        <van-image width="72" height="72" fit="cover" :src="item.cover" />
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="serial">编号 {{ item.serialNo }}</div>
          <van-tag plain :type="item.status === 'listing' ? 'primary' : 'default'">
            {{ statusMap[item.status] }}
          </van-tag>
          <div class="price">
            参考价 {{ item.referencePrice }} · 成交 {{ item.dealPriceMin }}~{{ item.dealPriceMax }} · 预计最高到账 {{ item.estimateIncome }}
          </div>
        </div>
        <div v-if="item.status === 'listing'" class="actions">
          <van-button size="mini" :loading="refreshingId === item.id" @click="onRefresh(item)">同步价</van-button>
          <van-button size="mini" type="danger" plain @click="onCancel(item)">撤单</van-button>
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
.price {
  color: #646566;
  font-size: 13px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}
</style>
