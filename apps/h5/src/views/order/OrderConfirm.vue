<script setup lang="ts">
import { onActivated, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showLoadingToast, showToast, closeToast } from 'vant';
import type { OrderPreview, UserAddress } from '@sharemall/shared';
import { fetchAddresses } from '@/api/address';
import { createOrder, previewOrder, type OrderItemInput } from '@/api/order';
import { fetchFundAccount } from '@/api/fund';
import { fetchMyCoupons } from '@/api/operations';

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
const showAddressPicker = ref(false);
const items = ref<CheckoutItem[]>([]);
const addresses = ref<UserAddress[]>([]);
const address = ref<UserAddress | null>(null);
const preview = ref<OrderPreview | null>(null);
const availableFund = ref(0);
const myCoupons = ref<Array<{ id: number; coupon: { name: string; minAmount: number } | null }>>([]);
const selectedCouponId = ref<number | null>(null);
const showCouponPicker = ref(false);
const isFirstActivation = ref(true);

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
  preview.value = await previewOrder({
    items: items.value.map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
    addressId: address.value.id,
    useFund: useFund.value,
    couponId: selectedCouponId.value ?? undefined,
  });
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

watch(useFund, () => {
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
      fundAmount: preview.value?.fundDeductAmount,
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
  <div class="page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else>
      <van-cell
        title="收货地址"
        :label="address ? `${address.receiver} ${address.phone}` : ''"
        :value="address ? address.fullAddress : '请选择'"
        is-link
        @click="openAddressPicker"
      />

      <van-card
        v-for="(item, idx) in items"
        :key="idx"
        :num="item.quantity"
        :price="item.price?.toFixed(2) ?? '0.00'"
        :title="item.title ?? '商品'"
        :thumb="item.mainImage"
      />

      <van-cell-group inset>
        <van-cell title="商品总额" :value="`¥${preview?.totalAmount.toFixed(2) ?? '0.00'}`" />
        <van-cell title="使用可用贡献金抵扣" :label="`可用 ${availableFund}`">
          <template #value>
            <van-switch v-model="useFund" size="20px" :disabled="availableFund <= 0" />
          </template>
        </van-cell>
        <van-cell
          v-if="useFund"
          title="贡献金抵扣"
          :value="`-¥${preview?.fundDeductAmount.toFixed(2) ?? '0.00'}`"
        />
        <van-cell
          title="优惠券"
          :value="selectedCouponId ? myCoupons.find((c) => c.id === selectedCouponId)?.coupon?.name ?? '已选' : (myCoupons.length ? '选择优惠券' : '暂无可用')"
          is-link
          @click="openCouponPicker"
        />
        <van-cell
          v-if="(preview?.couponAmount ?? 0) > 0"
          title="优惠券抵扣"
          :value="`-¥${preview?.couponAmount?.toFixed(2)}`"
        />
        <van-cell title="运费" :value="`¥${preview?.freight.toFixed(2) ?? '0.00'}`" />
        <van-cell title="预计可获贡献金（确认收货后到账）" :value="String(preview?.accruedFund ?? 0)" />
      </van-cell-group>

      <van-submit-bar
        :price="Math.round((preview?.payAmount ?? 0) * 100)"
        button-text="提交订单"
        :loading="submitting"
        @submit="submitOrder"
      />
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
              <van-tag v-if="addr.isDefault" type="primary" plain>默认</van-tag>
            </div>
            <div class="addr-detail">{{ addr.fullAddress }}</div>
          </div>
        </div>
        <div class="picker-footer">
          <van-button block plain type="primary" @click="goManageAddress">新增 / 管理地址</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showCouponPicker" position="bottom" round>
      <div style="padding: 16px">
        <div style="text-align: center; font-weight: 600; margin-bottom: 12px">选择优惠券</div>
        <van-cell title="不使用优惠券" is-link @click="selectCoupon(null)" />
        <van-cell
          v-for="c in myCoupons"
          :key="c.id"
          :title="c.coupon?.name ?? '优惠券'"
          :label="`满${c.coupon?.minAmount ?? 0}可用`"
          is-link
          @click="selectCoupon(c.id)"
        />
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 60px;
}
.picker {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  padding: 16px;
  box-sizing: border-box;
}
.picker-title {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}
.addr-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.picker-footer {
  flex-shrink: 0;
  padding-top: 12px;
}
.addr-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
}
.addr-item.active {
  border-color: #1989fa;
  background: #f0f9ff;
}
.addr-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.name {
  font-weight: 600;
}
.addr-detail {
  color: #646566;
  font-size: 13px;
  line-height: 1.4;
}
</style>
