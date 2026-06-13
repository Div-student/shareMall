<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showLoadingToast, showToast, closeToast } from 'vant';
import type { OrderDetail } from '@sharemall/shared';
import { fetchOrderDetail, receiveOrder } from '@/api/order';
import { useFundStore } from '@/stores/fund';

const route = useRoute();
const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const receiving = ref(false);
const order = ref<OrderDetail | null>(null);

const statusMap: Record<string, string> = {
  unpaid: '待付款',
  paid: '待发货',
  shipped: '待收货',
  received: '已收货',
  completed: '已完成',
  closed: '已关闭',
};

async function loadOrder() {
  loading.value = true;
  try {
    order.value = await fetchOrderDetail(route.params.id as string);
  } finally {
    loading.value = false;
  }
}

function onPay() {
  if (!order.value) return;
  router.push(`/order/pay/${order.value.id}`);
}

async function onReceive() {
  if (!order.value) return;
  try {
    await showConfirmDialog({ title: '确认收货', message: '请确认您已收到商品' });
    receiving.value = true;
    showLoadingToast({ message: '提交中...', forbidClick: true });
    const result = await receiveOrder(order.value.id);
    if (result.accruedFund > 0) {
      showToast(`确认收货成功，贡献金 +${result.accruedFund}`);
    } else {
      showToast('确认收货成功');
    }
    await fundStore.fetchAccount();
    await loadOrder();
  } catch {
    // 用户取消或失败
  } finally {
    closeToast();
    receiving.value = false;
  }
}

onMounted(loadOrder);
onActivated(loadOrder);
</script>

<template>
  <div class="page">
    <van-nav-bar title="订单详情" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else-if="order">
      <van-cell-group inset>
        <van-cell title="订单状态" :value="statusMap[order.status] ?? order.status" />
        <van-cell title="订单号" :value="order.orderNo" />
        <van-cell
          title="收货地址"
          :label="`${order.address.receiver} ${order.address.phone}`"
          :value="`${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`"
        />
      </van-cell-group>

      <van-card
        v-for="item in order.items"
        :key="item.id"
        :num="item.quantity"
        :price="item.price.toFixed(2)"
        :title="item.title"
        :thumb="item.mainImage"
        :desc="Object.values(item.spec ?? {}).join(' / ')"
      />

      <van-cell-group inset>
        <van-cell title="商品总额" :value="`¥${order.totalAmount.toFixed(2)}`" />
        <van-cell title="贡献金抵扣" :value="`-¥${order.fundDeductAmount.toFixed(2)}`" />
        <van-cell title="运费" :value="`¥${order.freight.toFixed(2)}`" />
        <van-cell title="实付金额" :value="`¥${order.payAmount.toFixed(2)}`" />
        <van-cell title="本单可获贡献金" :label="order.status === 'completed' ? '已到账' : '确认收货后到账'" :value="String(order.accruedFund)" />
      </van-cell-group>

      <div v-if="order.status === 'unpaid' || order.status === 'shipped'" class="footer-bar">
        <van-button
          v-if="order.status === 'unpaid'"
          block
          type="danger"
          @click="onPay"
        >
          去支付
        </van-button>
        <van-button
          v-else
          block
          type="primary"
          :loading="receiving"
          @click="onReceive"
        >
          确认收货
        </van-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 72px;
}
.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
</style>
