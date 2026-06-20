<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { cancelListing, fetchMyListings, refreshListing, type NftListingItem } from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

const GRADIENTS = [
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#2d1b4e,#8b5cf6)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
];

const statusMap: Record<NftListingItem['status'], { label: string; tagClass: string }> = {
  listing: { label: '在售', tagClass: 'tag-accent' },
  sold: { label: '已成交', tagClass: '' },
  cancelled: { label: '已撤销', tagClass: 'tag-danger' },
  removed: { label: '已下架', tagClass: '' },
};

const router = useRouter();
const loading = ref(true);
const list = ref<NftListingItem[]>([]);
const refreshingId = ref<number | null>(null);
const cancelOpen = ref(false);
const cancelTarget = ref<NftListingItem | null>(null);
const cancelling = ref(false);

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function formatMoney(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

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

function openCancel(item: NftListingItem) {
  cancelTarget.value = item;
  cancelOpen.value = true;
}

function closeCancel() {
  if (cancelling.value) return;
  cancelOpen.value = false;
  cancelTarget.value = null;
}

async function confirmCancel() {
  if (!cancelTarget.value || cancelling.value) return;
  cancelling.value = true;
  try {
    await cancelListing(cancelTarget.value.id);
    showToast('已撤单');
    cancelOpen.value = false;
    cancelTarget.value = null;
    await load();
  } finally {
    cancelling.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop my-listings-page">
    <SmAppHeader title="我的挂单" fixed @back="router.back()">
      <template #actions>
        <button type="button" class="header-link" @click="router.push('/nft/trade')">去购买</button>
      </template>
    </SmAppHeader>

    <main class="my-listings-body">
      <van-loading v-if="loading" class="my-listings-status" />

      <div v-else-if="!list.length" class="empty-state open">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <p>暂无挂单</p>
        <button type="button" class="btn btn-primary" @click="router.push('/nft/mine')">去我的藏品</button>
      </div>

      <div v-else class="listing-list">
        <article v-for="item in list" :key="item.id" class="listing-card">
          <div class="card-thumb">
            <img v-if="item.cover" :src="item.cover" :alt="item.name" />
            <div v-else class="ph-img" :style="{ background: thumbGradient(item.nftId) }">IMG</div>
          </div>
          <div class="card-info">
            <div class="card-name">{{ item.name }}</div>
            <div class="card-serial num">编号 {{ item.serialNo }}</div>
            <span class="tag" :class="statusMap[item.status].tagClass">{{ statusMap[item.status].label }}</span>
            <div class="card-price">
              参考价 <span class="num">¥{{ formatMoney(item.referencePrice) }}</span>
              · 成交 <span class="num">¥{{ formatMoney(item.dealPriceMin) }}~¥{{ formatMoney(item.dealPriceMax) }}</span>
              · 预计最高到账 <span class="num income">¥{{ formatMoney(item.estimateIncome) }}</span>
            </div>
          </div>
          <div v-if="item.status === 'listing'" class="card-actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="refreshingId === item.id"
              @click="onRefresh(item)"
            >
              {{ refreshingId === item.id ? '同步中…' : '同步价' }}
            </button>
            <button type="button" class="btn btn-cancel btn-sm" @click="openCancel(item)">撤单</button>
          </div>
        </article>
      </div>
    </main>

    <div class="confirm-overlay" :class="{ open: cancelOpen }" @click.self="closeCancel">
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
        <h3 id="cancel-title">确认撤单</h3>
        <p>撤销后藏品将恢复为持有中</p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-outline btn-sm" :disabled="cancelling" @click="closeCancel">取消</button>
          <button type="button" class="btn btn-primary btn-sm" :disabled="cancelling" @click="confirmCancel">
            {{ cancelling ? '处理中…' : '确认撤单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
