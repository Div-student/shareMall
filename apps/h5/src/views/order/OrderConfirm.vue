<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showLoadingToast, showToast, closeToast } from 'vant';
import type { OrderPreview, UserAddress } from '@sharemall/shared';
import { fetchAddresses } from '@/api/address';
import { createOrder, previewOrder, type OrderItemInput } from '@/api/order';
import { fetchFundAccount } from '@/api/fund';
import { fetchMyCoupons } from '@/api/operations';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import SmActionBar from '@/components/shop/SmActionBar.vue';
import SmAddressCard from '@/components/shop/SmAddressCard.vue';
import SmPriceBreakdown from '@/components/shop/SmPriceBreakdown.vue';

const CHECKOUT_ADDRESS_KEY = 'checkoutAddressId';

interface CheckoutItem extends OrderItemInput {
  title?: string;
  mainImage?: string;
  price?: number;
}

const router = useRouter();
const loading = ref(true);
const submitting = ref(false);
const useFund = ref(false);
const fundAmountInput = ref(0);
const fundInputError = ref(false);
const showAddressPicker = ref(false);
const couponExpanded = ref(false);
const items = ref<CheckoutItem[]>([]);
const addresses = ref<UserAddress[]>([]);
const address = ref<UserAddress | null>(null);
const preview = ref<OrderPreview | null>(null);
const availableFund = ref(0);
const myCoupons = ref<Array<{ id: number; coupon: { name: string; minAmount: number } | null }>>([]);
const selectedCouponId = ref<number | null>(null);
const showCouponPicker = ref(false);
const isFirstActivation = ref(true);

const maxFundDeduct = computed(() => {
  const cap = preview.value?.fundDeductMax ?? availableFund.value;
  return Math.min(availableFund.value, cap);
});

const selectedCoupon = computed(() =>
  myCoupons.value.find((c) => c.id === selectedCouponId.value)?.coupon ?? null,
);

function pickAddress(list: UserAddress[]) {
  const savedId = sessionStorage.getItem(CHECKOUT_ADDRESS_KEY);
  return (
    list.find((a) => String(a.id) === savedId) ??
    list.find((a) => a.isDefault) ??
    list[0] ??
    null
  );
}

async function loadPreview() {
  if (!address.value || !items.value.length) return;
  if (useFund.value && fundAmountInput.value > maxFundDeduct.value) {
    fundInputError.value = true;
    return;
  }
  fundInputError.value = false;
  preview.value = await previewOrder({
    items: items.value.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
    addressId: address.value.id,
    useFund: useFund.value,
    fundAmount: useFund.value ? fundAmountInput.value : undefined,
    couponId: selectedCouponId.value ?? undefined,
  });
  if (useFund.value && fundAmountInput.value === 0 && preview.value.fundDeductMax > 0) {
    fundAmountInput.value = Math.min(availableFund.value, preview.value.fundDeductMax);
    preview.value = await previewOrder({
      items: items.value.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
      addressId: address.value!.id,
      useFund: true,
      fundAmount: fundAmountInput.value,
      couponId: selectedCouponId.value ?? undefined,
    });
  }
}

async function loadAddresses(keepCurrent = false) {
  const addrRes = await fetchAddresses();
  addresses.value = addrRes.list;
  if (!keepCurrent || !address.value) {
    address.value = pickAddress(addrRes.list);
  } else {
    const matched = addrRes.list.find((a) => a.id === address.value!.id);
    address.value = matched ?? pickAddress(addrRes.list);
  }
  return addrRes.list;
}

async function loadMyCoupons() {
  const couponRes = await fetchMyCoupons().catch(() => ({ list: [] }));
  myCoupons.value = couponRes.list.filter((item) => item.status === 'unused' && item.coupon);
}

function selectAddress(addr: UserAddress) {
  address.value = addr;
  sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, String(addr.id));
  showAddressPicker.value = false;
  void loadPreview();
}

async function openAddressPicker() {
  await loadAddresses(true);
  if (!addresses.value.length) {
    router.push({ path: '/mine/address', query: { select: '1' } });
    return;
  }
  showAddressPicker.value = true;
}

function goManageAddress() {
  showAddressPicker.value = false;
  router.push({ path: '/mine/address', query: { select: '1' } });
}

function applyMaxFund() {
  fundAmountInput.value = maxFundDeduct.value;
  void loadPreview();
}

function onFundInputBlur() {
  if (fundAmountInput.value > maxFundDeduct.value) {
    fundInputError.value = true;
    return;
  }
  fundInputError.value = false;
  void loadPreview();
}

async function init() {
  loading.value = true;
  try {
    const raw = sessionStorage.getItem('checkoutItems');
    if (!raw) {
      showToast('请先选择商品');
      router.replace('/cart');
      return;
    }
    items.value = JSON.parse(raw) as CheckoutItem[];

    const [addrList, fundRes] = await Promise.all([loadAddresses(), fetchFundAccount(), loadMyCoupons()]);
    availableFund.value = fundRes.availableFund;

    if (!addrList.length) {
      showToast('请先添加收货地址');
      router.push({ path: '/mine/address', query: { select: '1' } });
      return;
    }

    if (!address.value) {
      showToast('请选择收货地址');
      return;
    }

    await loadPreview();
  } finally {
    loading.value = false;
  }
}

watch(useFund, (val) => {
  if (!val) {
    fundAmountInput.value = 0;
    fundInputError.value = false;
  }
  void loadPreview();
});

function selectCoupon(id: number | null) {
  selectedCouponId.value = id;
  showCouponPicker.value = false;
  void loadPreview();
}

async function openCouponPicker() {
  await loadMyCoupons();
  if (!myCoupons.value.length) {
    showToast('暂无可用优惠券');
    return;
  }
  showCouponPicker.value = true;
}

async function submitOrder() {
  if (!address.value || !items.value.length) return;
  submitting.value = true;
  const toast = showLoadingToast({ message: '提交中...', forbidClick: true });
  try {
    const result = await createOrder({
      items: items.value.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
      addressId: address.value.id,
      useFund: useFund.value,
      fundAmount: useFund.value ? fundAmountInput.value : undefined,
      couponId: selectedCouponId.value ?? undefined,
    });
    sessionStorage.removeItem('checkoutItems');
    router.replace(`/order/pay/${result.orderId}`);
  } finally {
    closeToast();
    submitting.value = false;
  }
}

async function refreshOnReturn() {
  if (!items.value.length) return;
  await Promise.all([loadAddresses(true), loadMyCoupons()]);
  await loadPreview();
}

onMounted(init);

onActivated(() => {
  if (isFirstActivation.value) {
    isFirstActivation.value = false;
    return;
  }
  void refreshOnReturn();
});
</script>

<template>
  <div class="page-shop has-action-bar">
    <SmAppHeader title="确认订单" @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else>
      <SmAddressCard :address="address" @click="openAddressPicker" />

      <div class="card-block">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="checkout-product-row"
        >
          <img :src="item.mainImage" class="thumb" alt="" />
          <div class="info">
            <div class="title">{{ item.title ?? '商品' }}</div>
            <div class="meta">x{{ item.quantity }}</div>
            <div class="price">¥{{ (item.price ?? 0).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <div class="card-block">
        <div class="toggle-row">
          <div class="toggle-info">
            <h4>贡献金抵扣</h4>
            <p>可用余额 {{ availableFund }}</p>
          </div>
          <button
            type="button"
            class="toggle-switch"
            :class="{ active: useFund }"
            :disabled="availableFund <= 0"
            @click="useFund = !useFund"
          />
        </div>
        <div v-if="useFund" class="fund-detail">
          <div class="fund-input-row">
            <input
              v-model.number="fundAmountInput"
              type="number"
              class="fund-input"
              :class="{ error: fundInputError }"
              placeholder="输入抵扣金额"
              @blur="onFundInputBlur"
            />
            <button type="button" class="btn btn-outline btn-sm" @click="applyMaxFund">最大</button>
          </div>
          <p v-if="fundInputError" style="font-size: var(--text-xs); color: var(--danger); margin-top: 4px">
            超出可用抵扣上限 ¥{{ maxFundDeduct.toFixed(2) }}
          </p>
        </div>
      </div>

      <div class="card-block coupon-row" @click="openCouponPicker">
        <div class="row-between" style="display: flex; justify-content: space-between; align-items: center">
          <span>优惠券</span>
          <span style="color: var(--muted); font-size: var(--text-sm)">
            {{ selectedCoupon?.name ?? (myCoupons.length ? '选择优惠券' : '暂无可用') }} ›
          </span>
        </div>
        <div
          v-if="selectedCoupon"
          class="coupon-expand"
          @click.stop="couponExpanded = !couponExpanded"
        >
          <span>{{ selectedCoupon.name }}（满{{ selectedCoupon.minAmount }}可用）</span>
          <button type="button" class="link-btn" @click.stop="selectCoupon(null)">不使用</button>
        </div>
      </div>

      <SmPriceBreakdown
        v-if="preview"
        :total-amount="preview.totalAmount"
        :fund-deduct-amount="preview.fundDeductAmount"
        :coupon-amount="preview.couponAmount"
        :freight="preview.freight"
        :pay-amount="preview.payAmount"
      />

      <div v-if="preview" class="preview-card">
        <p style="font-size: var(--text-sm); color: var(--muted)">确认收货后可获贡献金</p>
        <p class="preview-amount">{{ preview.accruedFund }}</p>
        <p style="font-size: var(--text-xs); color: var(--muted); margin-top: 4px">按实付金额比例计算，收货后入账</p>
      </div>

      <SmActionBar>
        <div style="flex: 1">
          <div style="font-size: var(--text-sm); color: var(--muted)">合计</div>
          <div style="font-family: var(--font-mono); font-size: var(--text-lg); font-weight: 600; color: var(--accent)">
            ¥{{ (preview?.payAmount ?? 0).toFixed(2) }}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-lg"
          style="min-width: 140px"
          :disabled="submitting"
          @click="submitOrder"
        >
          {{ submitting ? '提交中...' : '提交订单' }}
        </button>
      </SmActionBar>
    </template>

    <van-popup v-model:show="showAddressPicker" position="bottom" round>
      <div class="picker">
        <div class="picker-title">选择收货地址</div>
        <div class="addr-list">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="addr-item"
            :class="{ active: address?.id === addr.id }"
            @click="selectAddress(addr)"
          >
            <div class="addr-head">
              <span class="name">{{ addr.receiver }} {{ addr.phone }}</span>
              <span v-if="addr.isDefault" class="tag">默认</span>
            </div>
            <div class="addr-detail">{{ addr.fullAddress }}</div>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-block" @click="goManageAddress">新增 / 管理地址</button>
      </div>
    </van-popup>

    <van-popup v-model:show="showCouponPicker" position="bottom" round>
      <div class="picker">
        <div class="picker-title">选择优惠券</div>
        <div class="addr-list">
          <div class="addr-item" @click="selectCoupon(null)">不使用优惠券</div>
          <div
            v-for="c in myCoupons"
            :key="c.id"
            class="addr-item"
            :class="{ active: selectedCouponId === c.id }"
            @click="selectCoupon(c.id)"
          >
            <div class="name">{{ c.coupon?.name ?? '优惠券' }}</div>
            <div class="addr-detail">满{{ c.coupon?.minAmount ?? 0 }}可用</div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-info h4 {
  font-size: var(--text-base);
  font-weight: 500;
  margin: 0;
}

.toggle-info p {
  font-size: var(--text-sm);
  color: var(--muted);
  margin: 2px 0 0;
}

.fund-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: var(--font-mono);
}

.fund-input.error {
  border-color: var(--danger);
}

.coupon-row {
  cursor: pointer;
}

.link-btn {
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--text-sm);
  margin-left: var(--space-2);
}

.picker {
  padding: var(--space-4);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.picker-title {
  text-align: center;
  font-weight: 600;
}

.addr-list {
  overflow-y: auto;
  flex: 1;
}

.addr-item {
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  cursor: pointer;
}

.addr-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.addr-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.name {
  font-weight: 600;
}

.tag {
  font-size: var(--text-xs);
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.addr-detail {
  font-size: var(--text-sm);
  color: var(--muted);
  margin-top: 4px;
}
</style>
