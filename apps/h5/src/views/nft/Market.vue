<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchNftMarket, type NftItem } from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

type CatKey = 'all' | 'limited' | 'regular' | 'art' | 'culture';

const GRADIENTS = [
  'linear-gradient(135deg,#2d1b4e,#c96442)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#3a0a2a,#f47a8a)',
];

const CATEGORIES: { key: CatKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'limited', label: '限量款' },
  { key: 'regular', label: '常规款' },
  { key: 'art', label: '艺术类' },
  { key: 'culture', label: '文化类' },
];

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();

const loading = ref(true);
const refreshing = ref(false);
const list = ref<NftItem[]>([]);
const keyword = ref('');
const activeCat = ref<CatKey>('all');

function inferCategory(item: NftItem): Exclude<CatKey, 'all'> {
  const name = item.name;
  if (/敦煌|文化|飞天|系列/.test(name)) return 'culture';
  if (/画|花|流光|蓝图|幻彩|艺术/.test(name)) return 'art';
  if (item.totalSupply <= 100) return 'limited';
  return 'regular';
}

function stockTag(item: NftItem) {
  return item.totalSupply <= 100 ? '限量' : '常规';
}

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function formatRange(min: number, max: number) {
  return `成交区间 ¥${min}~¥${max}`;
}

const filteredList = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return list.value.filter((item) => {
    if (activeCat.value !== 'all' && inferCategory(item) !== activeCat.value) return false;
    if (q && !item.name.toLowerCase().includes(q)) return false;
    return true;
  });
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchNftMarket({ page: 1, pageSize: 50 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function onRefresh() {
  refreshing.value = true;
  try {
    if (userStore.isLoggedIn) {
      await fundStore.fetchAccount();
    }
    await load();
  } finally {
    refreshing.value = false;
  }
}

function goDetail(id: number) {
  router.push(`/nft/${id}`);
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await fundStore.fetchAccount();
  }
  await load();
});
</script>

<template>
  <div class="page-shop collectible-shop-page">
    <SmAppHeader title="藏品商城" fixed @back="router.back()" />

    <main class="page-body collectible-shop-body">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="pull-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          下拉刷新
        </div>

        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索数字藏品"
          >
        </div>

        <div class="cat-pills">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            class="pill-btn"
            :class="{ active: activeCat === cat.key }"
            @click="activeCat = cat.key"
          >
            {{ cat.label }}
          </button>
        </div>

        <van-loading v-if="loading && !refreshing" style="padding: 48px; text-align: center" />

        <div v-else-if="filteredList.length" class="collectible-grid">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="collectible-card"
            :data-cat="inferCategory(item)"
          >
            <div
              class="card-img"
              @click="goDetail(item.id)"
            >
              <img v-if="item.cover" :src="item.cover" :alt="item.name">
              <div
                v-else
                class="ph-img"
                :style="{ background: thumbGradient(item.id) }"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="card-body">
              <p class="card-name">{{ item.name }}</p>
              <div class="card-price">
                <span class="yuan">¥</span>{{ item.currentPrice }}
              </div>
              <div class="card-range">
                {{ formatRange(item.dealPriceMin, item.dealPriceMax) }}
              </div>
              <div class="card-stock">
                <span class="stock-tag">{{ stockTag(item) }}</span>
                <span class="stock-text">剩余{{ item.stock }}份</span>
              </div>
              <div class="card-action">
                <button type="button" class="btn btn-primary btn-sm" @click="goDetail(item.id)">
                  兑换
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <p>{{ keyword.trim() || activeCat !== 'all' ? '暂无此类藏品' : '暂无可兑换藏品' }}</p>
        </div>
      </van-pull-refresh>
    </main>
  </div>
</template>
