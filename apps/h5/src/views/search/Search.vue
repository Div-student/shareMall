<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ProductListItem, ProductSort } from '@sharemall/shared';
import { fetchProducts } from '@/api/product';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmProductCard from '@/components/shop/SmProductCard.vue';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;
const PAGE_SIZE = 10;

const HOT_KEYWORDS = ['蓝牙耳机', '护肤', '台灯', '坚果'];

const SORT_OPTIONS: { text: string; value: ProductSort }[] = [
  { text: '综合排序', value: 'default' },
  { text: '价格升序', value: 'price_asc' },
  { text: '价格降序', value: 'price_desc' },
  { text: '销量优先', value: 'sales' },
];

const route = useRoute();
const router = useRouter();
const keyword = ref('');
const sort = ref<ProductSort>('default');
const loading = ref(false);
const products = ref<ProductListItem[]>([]);
const history = ref<string[]>([]);
const page = ref(1);
const finished = ref(false);

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    history.value = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    history.value = [];
  }
}

function saveHistory(word: string) {
  const trimmed = word.trim();
  if (!trimmed) return;
  const next = [trimmed, ...history.value.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
  history.value = next;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem(HISTORY_KEY);
}

function buildParams(pageNo: number) {
  const q = keyword.value.trim();
  return {
    ...(q ? { keyword: q } : {}),
    sort: sort.value,
    page: pageNo,
    pageSize: PAGE_SIZE,
  };
}

async function resetAndLoad() {
  page.value = 1;
  finished.value = false;
  products.value = [];
  loading.value = true;
  try {
    const q = keyword.value.trim();
    if (q) saveHistory(q);
    const data = await fetchProducts(buildParams(1));
    products.value = data.list;
    finished.value = products.value.length >= data.total;
    page.value = 2;
  } finally {
    loading.value = false;
  }
}

async function doSearch(word?: string) {
  keyword.value = (word ?? keyword.value).trim();
  await resetAndLoad();
}

async function onLoadMore() {
  if (finished.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const data = await fetchProducts(buildParams(page.value));
    products.value.push(...data.list);
    finished.value = products.value.length >= data.total;
    page.value += 1;
  } finally {
    loading.value = false;
  }
}

function onSelectHistory(word: string) {
  keyword.value = word;
  void doSearch(word);
}

function onSelectHot(word: string) {
  keyword.value = word;
  void doSearch(word);
}

function onClear() {
  keyword.value = '';
  void resetAndLoad();
}

watch(sort, () => {
  void resetAndLoad();
});

watch(keyword, (val, oldVal) => {
  if (!val.trim() && oldVal?.trim()) {
    void resetAndLoad();
  }
});

function goBack() {
  if (window.history.state?.back) router.back();
  else router.replace('/home');
}

onMounted(() => {
  loadHistory();
  const q = typeof route.query.q === 'string' ? route.query.q.trim() : '';
  if (q) keyword.value = q;
  void resetAndLoad();
});
</script>

<template>
  <div class="page-shop search-page">
    <SmAppHeader title="搜索" @back="goBack" />

    <form class="search-form" action="/" @submit.prevent="doSearch()">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          v-model="keyword"
          type="search"
          class="search-input"
          placeholder="搜索商品"
          autofocus
          @keyup.enter="doSearch()"
        />
        <button v-if="keyword" type="button" class="clear-btn" @click="onClear">×</button>
      </div>
      <button type="submit" class="btn btn-primary btn-sm search-btn">搜索</button>
    </form>

    <template v-if="!keyword.trim()">
      <div v-if="history.length" class="section">
        <div class="section-header">
          <span>历史搜索</span>
          <button type="button" class="link-btn" @click="clearHistory">清空</button>
        </div>
        <div class="tags">
          <button
            v-for="h in history"
            :key="h"
            type="button"
            class="tag-chip"
            @click="onSelectHistory(h)"
          >
            {{ h }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span>热门搜索</span>
        </div>
        <div class="tags">
          <button
            v-for="h in HOT_KEYWORDS"
            :key="h"
            type="button"
            class="tag-chip hot"
            @click="onSelectHot(h)"
          >
            {{ h }}
          </button>
        </div>
      </div>
    </template>

    <van-dropdown-menu>
      <van-dropdown-item v-model="sort" :options="SORT_OPTIONS" />
    </van-dropdown-menu>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onLoadMore"
    >
      <van-empty
        v-if="!loading && !products.length"
        :description="keyword.trim() ? '未找到相关商品' : '暂无商品'"
      />
      <div v-else class="product-grid-2">
        <SmProductCard
          v-for="p in products"
          :key="p.id"
          :title="p.title"
          :image="p.mainImage"
          :price="p.price"
          :fund-amount="p.fundAmount"
          @click="router.push(`/product/${p.id}`)"
        />
      </div>
    </van-list>
  </div>
</template>

<style scoped>
.search-form {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--container-gutter) var(--space-2);
}

.search-form .search-bar {
  flex: 1;
  margin: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--fg);
}

.search-input::placeholder {
  color: var(--meta);
}

.clear-btn {
  border: none;
  background: none;
  font-size: 20px;
  color: var(--meta);
  padding: 0 4px;
}

.search-btn {
  flex-shrink: 0;
}

.section {
  padding: var(--space-3) var(--container-gutter);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  color: var(--muted);
}

.link-btn {
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--text-sm);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-chip {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
  color: var(--fg-2);
  cursor: pointer;
}

.tag-chip.hot {
  border-color: color-mix(in oklch, var(--accent) 30%, transparent);
  color: var(--accent);
  background: var(--accent-soft);
}
</style>
