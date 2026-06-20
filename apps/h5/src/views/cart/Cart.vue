<script setup lang="ts">
import { computed, onActivated, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { CartItem } from '@sharemall/shared';
import { fetchCart, removeCartItem, updateCartItem } from '@/api/cart';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmActionBar from '@/components/shop/SmActionBar.vue';
import SmQtyStepper from '@/components/shop/SmQtyStepper.vue';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cartStore = useCartStore();
const loading = ref(true);
const editing = ref(false);
const items = ref<CartItem[]>([]);

const validItems = computed(() => items.value.filter((i) => i.stock > 0));
const invalidItems = computed(() => items.value.filter((i) => i.stock <= 0));

const checkedItems = computed(() => validItems.value.filter((i) => i.checked));
const checkedAmount = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + i.lineAmount, 0),
);
const checkedFund = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + lineFund(i), 0),
);

function lineFund(item: CartItem) {
  return Math.round(item.fundAmount * item.quantity * 100) / 100;
}

const allChecked = computed({
  get: () => validItems.value.length > 0 && validItems.value.every((i) => i.checked),
  set: (val: boolean) => {
    validItems.value.forEach((i) => {
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
  if (window.history.state?.back) router.back();
  else router.replace('/home');
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
  <div class="page-shop has-action-bar has-tabbar">
    <SmAppHeader title="购物车" @back="goBack">
      <template #actions>
        <button type="button" class="edit-btn" @click="editing = !editing">
          {{ editing ? '完成' : '编辑' }}
        </button>
      </template>
    </SmAppHeader>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <div v-else-if="!items.length" class="empty-state">
      <div class="empty-icon">🛒</div>
      <p>购物车还是空的</p>
      <button type="button" class="btn btn-primary" @click="router.push('/home')">去选购</button>
    </div>

    <template v-else>
      <div v-for="item in validItems" :key="item.id" class="cart-item-row">
        <input v-model="item.checked" type="checkbox" class="checkbox-sm" />
        <img :src="item.mainImage" class="thumb" alt="" />
        <div class="item-body">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-spec">{{ Object.values(item.spec ?? {}).join(' / ') }}</div>
          <div class="item-row">
            <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
            <SmQtyStepper
              v-if="!editing"
              :model-value="item.quantity"
              :min="1"
              :max="item.stock"
              @change="(v) => onQuantityChange(item, v)"
            />
          </div>
          <div class="item-fund">可获贡献金 {{ lineFund(item) }}</div>
        </div>
        <button v-if="editing" type="button" class="delete-btn" @click="onRemove(item)">删除</button>
      </div>

      <div v-if="invalidItems.length" class="card-block invalid-section">
        <h4 class="invalid-title">失效商品</h4>
        <div v-for="item in invalidItems" :key="item.id" class="cart-item-row" style="opacity: 0.6">
          <img :src="item.mainImage" class="thumb" alt="" />
          <div class="item-body">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-spec">已失效 / 库存不足</div>
          </div>
          <button type="button" class="delete-btn" @click="onRemove(item)">删除</button>
        </div>
      </div>

      <SmActionBar above-tabbar>
        <input v-model="allChecked" type="checkbox" class="checkbox-sm" />
        <span style="font-size: var(--text-sm)">全选</span>
        <div style="flex: 1; text-align: right; margin-right: var(--space-2)">
          <div style="font-size: var(--text-sm); color: var(--muted)">
            合计 <span style="color: var(--accent); font-weight: 600; font-family: var(--font-mono)">¥{{ checkedAmount.toFixed(2) }}</span>
          </div>
          <div v-if="checkedFund > 0" style="font-size: var(--text-xs); color: var(--accent)">
            可获贡献金 {{ checkedFund.toFixed(2) }}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!checkedItems.length"
          @click="goCheckout"
        >
          结算({{ checkedItems.length }})
        </button>
      </SmActionBar>
    </template>
  </div>
</template>

<style scoped>
.edit-btn {
  font-size: var(--text-sm);
  color: var(--accent);
  border: none;
  background: none;
  padding: 4px 8px;
}

.delete-btn {
  font-size: var(--text-sm);
  color: var(--danger);
  border: none;
  background: none;
  flex-shrink: 0;
}

.invalid-title {
  font-size: var(--text-sm);
  color: var(--muted);
  margin-bottom: var(--space-2);
}
</style>
