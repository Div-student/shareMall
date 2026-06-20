<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMyNfts, type UserNftItem } from '@/api/nft';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

const GRADIENTS = [
  'linear-gradient(135deg,#1a2a4a,#5a8ac4)',
  'linear-gradient(135deg,#2d1b4e,#8b5cf6)',
  'linear-gradient(135deg,#4a2040,#e87ec2)',
  'linear-gradient(135deg,#5a3a1a,#d4a853)',
  'linear-gradient(135deg,#1a3a2a,#4a9d7a)',
];

const statusMap: Record<UserNftItem['status'], { label: string; tagClass: string }> = {
  holding: { label: '持有中', tagClass: 'tag-success' },
  listed: { label: '挂单中', tagClass: 'tag-warn' },
  sold: { label: '已售出', tagClass: 'tag-danger' },
  transferred: { label: '已转赠', tagClass: 'tag-danger' },
};

const router = useRouter();
const loading = ref(true);
const list = ref<UserNftItem[]>([]);

function thumbGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

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
  <div class="page-shop my-collectibles-page">
    <SmAppHeader title="我的数字藏品" fixed @back="router.back()">
      <template #actions>
        <button type="button" class="header-link" @click="router.push('/nft/trade')">二级市场</button>
      </template>
    </SmAppHeader>

    <main class="my-collectibles-body">
      <div class="toolbar">
        <button type="button" class="btn btn-outline btn-sm" @click="router.push('/nft/market')">去兑换</button>
        <button type="button" class="btn btn-outline btn-sm" @click="router.push('/nft/listings')">我的挂单</button>
      </div>

      <van-loading v-if="loading" class="my-collectibles-status" />

      <div v-else-if="!list.length" class="empty-state open">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p>暂无藏品，去商城兑换吧</p>
        <button type="button" class="btn btn-primary" @click="router.push('/nft/market')">藏品商城</button>
      </div>

      <div v-else class="collectible-list">
        <article
          v-for="item in list"
          :key="item.id"
          class="collectible-card"
          @click="router.push(`/nft/mine/${item.id}`)"
        >
          <div class="card-thumb">
            <img v-if="item.cover" :src="item.cover" :alt="item.name" />
            <div v-else class="ph-img" :style="{ background: thumbGradient(item.nftId) }">IMG</div>
          </div>
          <div class="card-info">
            <div class="card-name">{{ item.name }}</div>
            <div class="card-serial num">编号 {{ item.serialNo }}</div>
            <div class="card-meta">
              <span class="tag" :class="statusMap[item.status].tagClass">{{ statusMap[item.status].label }}</span>
              <span class="card-date">{{ formatDate(item.acquiredAt) }}</span>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>
