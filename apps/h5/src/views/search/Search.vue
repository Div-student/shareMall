<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ProductListItem } from '@sharemall/shared';
import { fetchProducts } from '@/api/product';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

const router = useRouter();
const keyword = ref('');
const loading = ref(false);
const searched = ref(false);
const products = ref<ProductListItem[]>([]);
const history = ref<string[]>([]);

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

async function doSearch(word?: string) {
  const q = (word ?? keyword.value).trim();
  keyword.value = q;
  loading.value = true;
  searched.value = true;
  try {
    if (q) saveHistory(q);
    const data = await fetchProducts({ keyword: q || undefined, page: 1, pageSize: 20 });
    products.value = data.list;
  } finally {
    loading.value = false;
  }
}

function onSelectHistory(word: string) {
  keyword.value = word;
  void doSearch(word);
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/home');
  }
}

onMounted(() => {
  loadHistory();
  void doSearch('');
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
        autofocus
        @search="doSearch()"
        @cancel="goBack"
      />
    </form>

    <div v-if="!searched || loading" class="status">
      <van-loading v-if="loading" />
    </div>

    <template v-else>
      <div v-if="!keyword && history.length" class="history">
        <div class="history-header">
          <span>历史搜索</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="history-tags">
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

      <van-empty v-if="!products.length" :description="keyword ? '未找到相关商品' : '暂无商品'" />
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
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.status {
  padding: 24px;
  text-align: center;
}
.history {
  padding: 12px 16px;
}
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #646566;
}
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
