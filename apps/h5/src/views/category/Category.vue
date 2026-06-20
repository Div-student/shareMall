<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { CategoryTreeItem, ProductListItem, ProductSort } from '@sharemall/shared';
import { fetchCategories, fetchProducts } from '@/api/product';
import SmProductCard from '@/components/shop/SmProductCard.vue';

const PAGE_SIZE = 10;

const SORT_OPTIONS: { text: string; value: ProductSort }[] = [
  { text: '综合排序', value: 'default' },
  { text: '价格升序', value: 'price_asc' },
  { text: '价格降序', value: 'price_desc' },
  { text: '销量优先', value: 'sales' },
];

const route = useRoute();
const router = useRouter();

const categories = ref<CategoryTreeItem[]>([]);
const activeRootIndex = ref(0);
const activeSubIndex = ref(0);
const sort = ref<ProductSort>('default');
const sortOpen = ref(false);
const products = ref<ProductListItem[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const initLoading = ref(true);

const activeRoot = computed(() => categories.value[activeRootIndex.value]);
const subTabs = computed(() => {
  const children = activeRoot.value?.children ?? [];
  return [{ id: 0, name: '全部' }, ...children];
});
const sortLabel = computed(() => SORT_OPTIONS.find((o) => o.value === sort.value)?.text ?? '综合排序');

function resolveRootIndex() {
  const id = Number(route.query.id);
  if (!id || !categories.value.length) return 0;
  const index = categories.value.findIndex((c) => c.id === id);
  return index >= 0 ? index : 0;
}

async function loadCategories() {
  const data = await fetchCategories();
  categories.value = data.list;
  activeRootIndex.value = resolveRootIndex();
}

function buildQueryParams() {
  const root = activeRoot.value;
  if (!root) return null;

  const sub = subTabs.value[activeSubIndex.value];
  const params: Parameters<typeof fetchProducts>[0] = {
    sort: sort.value,
    page: page.value,
    pageSize: PAGE_SIZE,
  };

  if (sub?.id === 0) {
    params.parentCategoryId = root.id;
  } else if (sub?.id) {
    params.categoryId = sub.id;
  } else {
    params.parentCategoryId = root.id;
  }

  return params;
}

async function resetAndLoad() {
  if (!activeRoot.value) return;
  page.value = 1;
  finished.value = false;
  products.value = [];
  total.value = 0;
  loading.value = true;
  try {
    const params = buildQueryParams();
    if (!params) return;
    params.page = 1;
    const data = await fetchProducts(params);
    products.value = data.list;
    total.value = data.total;
    finished.value = products.value.length >= data.total;
    page.value = 2;
  } finally {
    loading.value = false;
  }
}

async function onLoadMore() {
  if (loading.value || finished.value || !activeRoot.value) return;
  loading.value = true;
  try {
    const params = buildQueryParams();
    if (!params) return;
    const data = await fetchProducts(params);
    products.value.push(...data.list);
    total.value = data.total;
    finished.value = products.value.length >= data.total;
    page.value += 1;
  } finally {
    loading.value = false;
  }
}

function onMainScroll(e: Event) {
  if (loading.value || finished.value) return;
  const el = e.target as HTMLElement;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
    void onLoadMore();
  }
}

function onRootChange(index: number) {
  if (activeRootIndex.value === index) return;
  activeRootIndex.value = index;
  activeSubIndex.value = 0;
  sortOpen.value = false;
  const name = categories.value[index]?.name;
  if (name) showToast(`已切换至「${name}」`);
  void resetAndLoad();
}

function onSubChange(index: number) {
  if (activeSubIndex.value === index) return;
  activeSubIndex.value = index;
  sortOpen.value = false;
  void resetAndLoad();
}

function toggleSort() {
  sortOpen.value = !sortOpen.value;
}

function selectSort(value: ProductSort, label: string) {
  const changed = sort.value !== value;
  sort.value = value;
  sortOpen.value = false;
  if (changed) {
    showToast(`已切换排序：${label}`);
    void resetAndLoad();
  }
}

watch(
  () => route.query.id,
  () => {
    if (!categories.value.length) return;
    activeRootIndex.value = resolveRootIndex();
    activeSubIndex.value = 0;
    void resetAndLoad();
  },
);

onMounted(async () => {
  try {
    await loadCategories();
    await resetAndLoad();
  } finally {
    initLoading.value = false;
  }
});
</script>

<template>
  <div class="page-shop has-tabbar category-page">
    <header class="category-header">
      <h1>商品分类</h1>
    </header>

    <van-loading v-if="initLoading" class="category-status" />

    <div v-else-if="!categories.length" class="category-status">
      <van-empty description="暂无分类" />
    </div>

    <div v-else class="category-layout">
      <aside class="category-sidebar">
        <button
          v-for="(c, index) in categories"
          :key="c.id"
          type="button"
          class="side-item"
          :class="{ active: activeRootIndex === index }"
          @click="onRootChange(index)"
        >
          {{ c.name }}
        </button>
      </aside>

      <main class="category-main" @scroll="onMainScroll">
        <div class="sub-tabs">
          <button
            v-for="(tab, index) in subTabs"
            :key="tab.id"
            type="button"
            class="sub-tab"
            :class="{ active: activeSubIndex === index }"
            @click="onSubChange(index)"
          >
            {{ tab.name }}
          </button>
        </div>

        <div class="sort-bar">
          <button type="button" class="sort-trigger" :class="{ open: sortOpen }" @click="toggleSort">
            <span>{{ sortLabel }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <span class="result-count">共 {{ total }} 件</span>
        </div>

        <div class="sort-menu" :class="{ open: sortOpen }">
          <button
            v-for="opt in SORT_OPTIONS"
            :key="opt.value"
            type="button"
            class="sort-option"
            :class="{ active: sort === opt.value }"
            @click="selectSort(opt.value, opt.text)"
          >
            {{ opt.text }}
          </button>
        </div>

        <van-loading v-if="loading && !products.length" class="category-status" />

        <div v-else-if="!products.length" class="category-empty-products">
          <van-empty description="该分类暂无商品" />
        </div>

        <div v-else class="product-grid-2 category-product-grid">
          <SmProductCard
            v-for="p in products"
            :key="p.id"
            :title="p.title"
            :image="p.mainImage"
            :price="p.price"
            :fund-amount="p.fundAmount"
            :sales="p.sales"
            @click="router.push(`/product/${p.id}`)"
          />
        </div>

        <div v-if="finished && products.length" class="load-hint">没有更多了</div>
        <div v-else-if="loading && products.length" class="load-hint">加载中...</div>
      </main>
    </div>
  </div>
</template>
