<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { CategoryTreeItem, ProductListItem, ProductSort } from '@sharemall/shared';
import { fetchCategories, fetchProducts } from '@/api/product';

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
const products = ref<ProductListItem[]>([]);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const initLoading = ref(true);

const activeRoot = computed(() => categories.value[activeRootIndex.value]);
const subTabs = computed(() => {
  const children = activeRoot.value?.children ?? [];
  return [{ id: 0, name: '全部' }, ...children];
});

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
  loading.value = true;
  try {
    const params = buildQueryParams();
    if (!params) return;
    params.page = 1;
    const data = await fetchProducts(params);
    products.value = data.list;
    finished.value = products.value.length >= data.total;
    page.value = 2;
  } finally {
    loading.value = false;
  }
}

async function onLoadMore() {
  if (finished.value || !activeRoot.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const params = buildQueryParams();
    if (!params) return;
    const data = await fetchProducts(params);
    products.value.push(...data.list);
    finished.value = products.value.length >= data.total;
    page.value += 1;
  } finally {
    loading.value = false;
  }
}

function onRootChange(index: number) {
  activeRootIndex.value = index;
  activeSubIndex.value = 0;
  void resetAndLoad();
}

function onSubChange(index: number) {
  activeSubIndex.value = index;
  void resetAndLoad();
}

watch(sort, () => {
  if (!initLoading.value) void resetAndLoad();
});

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
  <div class="page">
    <van-nav-bar title="商品分类" left-arrow @click-left="router.back()" />

    <van-loading v-if="initLoading" class="status" />

    <div v-else-if="!categories.length" class="status">
      <van-empty description="暂无分类" />
    </div>

    <div v-else class="layout">
      <van-sidebar v-model="activeRootIndex" @change="onRootChange">
        <van-sidebar-item v-for="c in categories" :key="c.id" :title="c.name" />
      </van-sidebar>

      <div class="main">
        <van-tabs v-if="subTabs.length > 1" v-model:active="activeSubIndex" shrink @change="onSubChange">
          <van-tab v-for="(tab, index) in subTabs" :key="tab.id" :title="tab.name" :name="index" />
        </van-tabs>

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
          <van-empty v-if="!loading && !products.length" description="该分类暂无商品" />
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
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.status {
  padding: 48px 24px;
  text-align: center;
}
.layout {
  display: flex;
  height: calc(100vh - 46px);
}
.main {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}
</style>
