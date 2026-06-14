<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ProductListItem, ProductSort } from '@sharemall/shared';
import { fetchProducts } from '@/api/product';

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
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/home');
  }
}

onMounted(() => {
  loadHistory();
  const q = typeof route.query.q === 'string' ? route.query.q.trim() : '';
  if (q) {
    keyword.value = q;
  }
  void resetAndLoad();
});
</script>

<template>
  <div class="page">
    <form action="/" @submit.prevent="doSearch()">
      <van-search
        v-model="keyword"
        placeholder="搜索商品"
        shape="round"
        show-action
        clearable
        autofocus
        @search="doSearch()"
        @clear="onClear"
        @cancel="goBack"
      />
    </form>

    <template v-if="!keyword.trim()">
      <div v-if="history.length" class="section">
        <div class="section-header">
          <span>历史搜索</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="tags">
          <van-tag
            v-for="h in history"
            :key="h"
            plain
            type="primary"
            size="medium"
            @click="onSelectHistory(h)"
          >
            {{ h }}
          </van-tag>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span>热门搜索</span>
        </div>
        <div class="tags">
          <van-tag
            v-for="h in HOT_KEYWORDS"
            :key="h"
            plain
            type="danger"
            size="medium"
            @click="onSelectHot(h)"
          >
            {{ h }}
          </van-tag>
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
      <van-card
        v-for="p in products"
        v-else
        :key="p.id"
        :price="p.price.toFixed(2)"
        :title="p.title"
        :thumb="p.mainImage"
        :desc="`可获贡献金 ${p.fundAmount}`"
        @click="router.push(`/product/${p.id}`)"
      />
    </van-list>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.section {
  padding: 12px 16px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #646566;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
