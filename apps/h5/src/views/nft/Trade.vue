<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { storeToRefs } from 'pinia';
import { buyListing, fetchTradeConfig, fetchTradeMarket, type NftListingItem } from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

type SortKey = 'latest' | 'price-asc' | 'price-desc';

const GRADIENTS = [
  'linear-gradient(135deg,#2d1b4e,#c96442)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#3a0a2a,#f47a8a)',
];

const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();
const { account } = storeToRefs(fundStore);
const { isLoggedIn } = storeToRefs(userStore);

const loading = ref(true);
const buying = ref(false);
const enabled = ref(true);
const list = ref<NftListingItem[]>([]);
const keyword = ref('');
const sortKey = ref<SortKey>('latest');
const showModal = ref(false);
const selectedItem = ref<NftListingItem | null>(null);

const filteredList = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  let items = list.value;
  if (q) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q),
    );
  }
  const sorted = [...items];
  if (sortKey.value === 'price-asc') {
    sorted.sort((a, b) => a.referencePrice - b.referencePrice);
  } else if (sortKey.value === 'price-desc') {
    sorted.sort((a, b) => b.referencePrice - a.referencePrice);
  }
  return sorted;
});

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function thumbLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '藏品';
  return trimmed.slice(0, 2);
}

function sellerAvatarChar(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '卖';
  return trimmed.slice(0, 1);
}

function formatPriceRange(min: number, max: number) {
  return `¥${min}~¥${max}`;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '刚刚挂单';
  if (minutes < 60) return `${minutes}分钟前挂单`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前挂单`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '昨天挂单';
  if (days < 7) return `${days}天前挂单`;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}挂单`;
}

async function load() {
  loading.value = true;
  try {
    const [cfg, market] = await Promise.all([
      fetchTradeConfig(),
      fetchTradeMarket({ page: 1, pageSize: 50 }),
    ]);
    enabled.value = cfg.enabled;
    list.value = market.list;
    if (isLoggedIn.value) {
      await fundStore.fetchAccount();
    }
  } finally {
    loading.value = false;
  }
}

function openBuyModal(item: NftListingItem) {
  if (!enabled.value) {
    showToast('二级市场暂未开放');
    return;
  }
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/nft/trade' } });
    return;
  }
  selectedItem.value = item;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedItem.value = null;
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeModal();
}

async function confirmBuy() {
  const item = selectedItem.value;
  if (!item || buying.value) return;

  if ((account.value?.availableFund ?? 0) < item.dealPriceMax) {
    showToast('可用贡献金不足（需覆盖最高成交价）');
    return;
  }

  buying.value = true;
  try {
    await buyListing(item.id);
    closeModal();
    showToast('购买请求已提交，等待系统确认');
    await Promise.all([load(), fundStore.fetchAccount()]);
  } catch {
    /* toast handled by interceptor */
  } finally {
    buying.value = false;
  }
}

watch(showModal, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

onMounted(load);
</script>

<template>
  <div class="page-shop collectible-market-page">
    <SmAppHeader title="二级市场" fixed @back="router.back()" />

    <main class="page-body collectible-market-body">
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索二级市场藏品"
        >
      </div>

      <div class="sort-bar">
        <button
          type="button"
          class="sort-btn"
          :class="{ active: sortKey === 'latest' }"
          @click="sortKey = 'latest'"
        >
          最新
        </button>
        <button
          type="button"
          class="sort-btn"
          :class="{ active: sortKey === 'price-asc' }"
          @click="sortKey = 'price-asc'"
        >
          价格↑
        </button>
        <button
          type="button"
          class="sort-btn"
          :class="{ active: sortKey === 'price-desc' }"
          @click="sortKey = 'price-desc'"
        >
          价格↓
        </button>
      </div>

      <van-loading v-if="loading" style="padding: 48px; text-align: center" />

      <div v-else-if="!enabled" class="market-empty">二级市场暂未开放</div>

      <div v-else-if="!filteredList.length" class="market-empty">
        {{ keyword.trim() ? '未找到相关藏品' : '暂无在售藏品' }}
      </div>

      <div v-else class="market-list">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="market-item"
          :data-price="item.referencePrice"
        >
          <div class="item-thumb">
            <img v-if="item.cover" :src="item.cover" :alt="item.name">
            <div
              v-else
              class="ph-img"
              :style="{ background: thumbGradient(item.id) }"
            >
              {{ thumbLabel(item.name) }}
            </div>
          </div>
          <div class="item-info">
            <div class="item-top">
              <div class="item-name">{{ item.name }}</div>
              <div class="seller-row">
                <div class="seller-avatar">{{ sellerAvatarChar(item.sellerName) }}</div>
                <span>卖家：{{ item.sellerName }}</span>
              </div>
            </div>
            <div class="item-prices">
              <span class="item-ref-price">
                <span class="yuan">¥</span>{{ item.referencePrice }}
              </span>
              <span class="item-range num">{{ formatPriceRange(item.dealPriceMin, item.dealPriceMax) }}</span>
            </div>
            <div class="item-bottom">
              <span class="item-time">{{ formatRelativeTime(item.createdAt) }}</span>
              <button type="button" class="btn-buy" @click.stop="openBuyModal(item)">
                购买
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      class="market-modal-overlay"
      :class="{ open: showModal }"
      @click="onOverlayClick"
    />
    <div class="market-modal-sheet" :class="{ open: showModal }">
      <div class="modal-title">确认购买</div>
      <div v-if="selectedItem" class="modal-item-info">
        <div class="modal-thumb">
          <img v-if="selectedItem.cover" :src="selectedItem.cover" :alt="selectedItem.name">
          <div
            v-else
            class="ph-img"
            :style="{ background: thumbGradient(selectedItem.id) }"
          >
            {{ thumbLabel(selectedItem.name) }}
          </div>
        </div>
        <div>
          <div class="modal-name">{{ selectedItem.name }}</div>
          <div class="modal-seller">卖家：{{ selectedItem.sellerName }}</div>
        </div>
      </div>
      <div v-if="selectedItem" class="modal-price-info">
        <div class="modal-ref-price">
          <span class="yuan">¥</span>{{ selectedItem.referencePrice }}
        </div>
        <div class="modal-range">
          成交价格区间：{{ formatPriceRange(selectedItem.dealPriceMin, selectedItem.dealPriceMax) }}
        </div>
      </div>
      <div class="modal-warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>实际成交价格由系统在价格区间内随机确定，购买后不可撤销。请确认可用贡献金充足。</span>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
        <button type="button" class="btn btn-primary" :disabled="buying" @click="confirmBuy">
          确认购买
        </button>
      </div>
    </div>
  </div>
</template>
