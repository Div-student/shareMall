<script setup lang="ts">
import { onActivated, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import type { OrderListItem } from '@sharemall/shared';
import { fetchOrders, receiveOrder } from '@/api/order';
import { useFundStore } from '@/stores/fund';

const router = useRouter();
const fundStore = useFundStore();
const active = ref(0);
const loading = ref(true);
const orders = ref<OrderListItem[]>([]);

const PENDING_STATUSES = ['unpaid', 'paid', 'shipped'] as const;
type PendingStatus = (typeof PENDING_STATUSES)[number];

const statusCounts = ref<Record<PendingStatus, number>>({
  unpaid: 0,
  paid: 0,
  shipped: 0,
});

const tabs = [
  { title: '全部', status: 'all' },
  { title: '待付款', status: 'unpaid' },
  { title: '待发货', status: 'paid' },
  { title: '待收货', status: 'shipped' },
  { title: '已完成', status: 'completed' },
];

const statusMap: Record<string, string> = {
  unpaid: '待付款',
  paid: '待发货',
  shipped: '待收货',
  received: '已收货',
  completed: '已完成',
  closed: '已关闭',
};

function tabBadge(status: string) {
  if (!PENDING_STATUSES.includes(status as PendingStatus)) return '';
  const n = statusCounts.value[status as PendingStatus];
  if (n <= 0) return '';
  return n > 99 ? '99+' : n;
}

async function loadStatusCounts() {
  const results = await Promise.all(
    PENDING_STATUSES.map((status) => fetchOrders({ status, page: 1 })),
  );
  PENDING_STATUSES.forEach((status, i) => {
    statusCounts.value[status] = results[i].total;
  });
}

async function loadOrders() {
  loading.value = true;
  try {
    const res = await fetchOrders({ status: tabs[active.value].status });
    orders.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  await Promise.all([loadOrders(), loadStatusCounts()]);
}

function onPay(order: OrderListItem, event: Event) {
  event.stopPropagation();
  router.push(`/order/pay/${order.id}`);
}

async function onReceive(order: OrderListItem, event: Event) {
  event.stopPropagation();
  try {
    await showConfirmDialog({ title: '确认收货', message: '请确认您已收到商品' });
    const result = await receiveOrder(order.id);
    if (result.accruedFund > 0) {
      showToast(`确认收货成功，贡献金 +${result.accruedFund}`);
    } else {
      showToast('确认收货成功');
    }
    await fundStore.fetchAccount();
    await refresh();
  } catch {
    // 用户取消
  }
}

const ORDERS_TAB_KEY = 'ordersTab';

watch(active, loadOrders);

onActivated(async () => {
  const tab = sessionStorage.getItem(ORDERS_TAB_KEY);
  if (tab) {
    const idx = tabs.findIndex((t) => t.status === tab);
    if (idx >= 0) active.value = idx;
    sessionStorage.removeItem(ORDERS_TAB_KEY);
  }
  await refresh();
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="active">
      <van-tab
        v-for="t in tabs"
        :key="t.status"
        :title="t.title"
        :badge="tabBadge(t.status)"
        :show-zero-badge="false"
      />
    </van-tabs>

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <van-empty v-else-if="!orders.length" description="暂无订单" />
    <div v-else class="list">
      <div v-for="order in orders" :key="order.id" class="order-card" @click="router.push(`/orders/${order.id}`)">
        <div class="head">
          <span>{{ order.orderNo }}</span>
          <span class="status">{{ statusMap[order.status] ?? order.status }}</span>
        </div>
        <div v-for="item in order.items" :key="item.id" class="item">
          <img :src="item.mainImage" class="thumb" alt="" />
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">¥{{ item.price.toFixed(2) }} x{{ item.quantity }}</div>
          </div>
        </div>
        <div class="foot">
          实付 ¥{{ order.payAmount.toFixed(2) }}
          <span v-if="order.accruedFund > 0" class="fund">
            +{{ order.accruedFund }} 贡献金{{ order.status === 'completed' ? '' : '（待到账）' }}
          </span>
        </div>
        <div v-if="order.status === 'unpaid' || order.status === 'shipped'" class="actions" @click.stop>
          <van-button
            v-if="order.status === 'unpaid'"
            size="small"
            type="danger"
            @click="onPay(order, $event)"
          >
            去支付
          </van-button>
          <van-button
            v-if="order.status === 'shipped'"
            size="small"
            type="primary"
            plain
            @click="onReceive(order, $event)"
          >
            确认收货
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 16px;
}
.list {
  padding: 8px;
}
.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}
.head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}
.status {
  color: #ee0a24;
}
.item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.info {
  flex: 1;
}
.title {
  font-size: 14px;
}
.meta {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}
.foot {
  text-align: right;
  font-size: 14px;
}
.fund {
  color: #ff976a;
  font-size: 12px;
  margin-left: 8px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebedf0;
}
</style>
