<script setup lang="ts">
import { computed, onActivated, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { CartItem } from '@sharemall/shared';
import { addToCart, fetchCart, removeCartItem, updateCartItem } from '@/api/cart';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cartStore = useCartStore();
const loading = ref(true);
const items = ref<CartItem[]>([]);

const checkedItems = computed(() => items.value.filter((i) => i.checked));
const checkedAmount = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + i.lineAmount, 0),
);
const totalFund = computed(() => {
  const sum = items.value.reduce((acc, i) => acc + lineFund(i), 0);
  return Math.round(sum * 100) / 100;
});

function lineFund(item: CartItem) {
  return Math.round(item.fundAmount * item.quantity * 100) / 100;
}
const allChecked = computed({
  get: () => items.value.length > 0 && items.value.every((i) => i.checked),
  set: (val: boolean) => {
    items.value.forEach((i) => {
      i.checked = val;
    });
  },
});

async function loadCart() {
  loading.value = true;
  try {
    const data = await fetchCart();
    items.value = data.items;
    cartStore.syncFromItems(data.items);
  } finally {
    loading.value = false;
  }
}

async function onQuantityChange(item: CartItem, quantity: number) {
  if (quantity < 1) return;
  await updateCartItem(item.id, quantity);
  item.quantity = quantity;
  item.lineAmount = Math.round(item.price * quantity * 100) / 100;
  cartStore.syncFromItems(items.value);
}

async function onRemove(item: CartItem) {
  await removeCartItem(item.id);
  showToast('已删除');
  await loadCart();
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/home');
  }
}

function goCheckout() {
  if (!checkedItems.value.length) {
    showToast('请选择商品');
    return;
  }
  const checkoutItems = checkedItems.value.map((i) => ({
    skuId: i.skuId,
    quantity: i.quantity,
    title: i.title,
    mainImage: i.mainImage,
    price: i.price,
  }));
  sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutItems));
  router.push('/order/confirm');
}

onActivated(loadCart);
</script>

<template>
  <div class="page">
    <van-nav-bar title="购物车" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <van-empty v-else-if="!items.length" description="购物车为空" />
    <div v-else class="list">
      <div v-for="item in items" :key="item.id" class="cart-item">
          <van-checkbox v-model="item.checked" />
          <img :src="item.mainImage" class="thumb" alt="" />
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="spec">{{ Object.values(item.spec ?? {}).join(' / ') }}</div>
            <div class="row">
              <span class="price">¥{{ item.price.toFixed(2) }}</span>
              <van-stepper
                :model-value="item.quantity"
                :min="1"
                :max="item.stock"
                @change="(v: number) => onQuantityChange(item, v)"
              />
            </div>
            <div class="fund">可获贡献金 {{ lineFund(item) }}</div>
          </div>
          <van-icon name="delete-o" class="delete" @click="onRemove(item)" />
        </div>
      <div class="summary">预计可获贡献金：{{ totalFund }}</div>
    </div>

    <van-submit-bar
      class="cart-submit-bar"
      :price="Math.round(checkedAmount * 100)"
      button-text="去结算"
      :disabled="!checkedItems.length"
      safe-area-inset-bottom
      @submit="goCheckout"
    >
      <van-checkbox v-model="allChecked">全选</van-checkbox>
    </van-submit-bar>
  </div>
</template>

<style scoped>
.page {
  /* 结算栏 + 底部 TabBar */
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}
:deep(.cart-submit-bar.van-submit-bar) {
  bottom: 50px;
}
.list {
  padding: 8px 0;
}
.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 8px;
}
.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.info {
  flex: 1;
  min-width: 0;
}
.title {
  font-size: 14px;
  line-height: 1.4;
}
.spec {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.price {
  color: #ee0a24;
  font-weight: 600;
}
.fund {
  color: #ff976a;
  font-size: 12px;
  margin-top: 4px;
}
.delete {
  color: #969799;
  padding: 4px;
}
.summary {
  text-align: right;
  padding: 8px 16px;
  color: #969799;
  font-size: 12px;
}
</style>
