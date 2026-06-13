<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  fetchAdminOrderDetail,
  fetchAdminOrders,
  shipAdminOrder,
  type AdminOrderDetail,
  type AdminOrderListItem,
} from '@/api/order';

const loading = ref(false);
const detailLoading = ref(false);
const list = ref<AdminOrderListItem[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const detail = ref<AdminOrderDetail | null>(null);

const query = reactive({
  status: 'all',
  orderNo: '',
  page: 1,
  pageSize: 20,
});

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'unpaid' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已收货', value: 'received' },
  { label: '已完成', value: 'completed' },
  { label: '已关闭', value: 'closed' },
];

const statusMap: Record<string, string> = {
  unpaid: '待付款',
  paid: '待发货',
  shipped: '待收货',
  received: '已收货',
  completed: '已完成',
  closed: '已关闭',
};

function formatTime(value?: string | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminOrders({
      status: query.status,
      orderNo: query.orderNo || undefined,
      page: query.page,
      pageSize: query.pageSize,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  query.page = 1;
  void loadData();
}

function onPageChange(page: number) {
  query.page = page;
  void loadData();
}

async function openDetail(row: AdminOrderListItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    detail.value = await fetchAdminOrderDetail(row.id);
  } finally {
    detailLoading.value = false;
  }
}

async function onShip(row: Pick<AdminOrderListItem, 'id' | 'orderNo'>) {
  await ElMessageBox.confirm(`确认对订单 ${row.orderNo} 发货？`, '发货确认', { type: 'warning' });
  await shipAdminOrder(row.id);
  ElMessage.success('发货成功');
  if (detail.value?.id === row.id) {
    detail.value = await fetchAdminOrderDetail(row.id);
  }
  await loadData();
}

onMounted(loadData);
</script>

<template>
  <el-card>
    <template #header>
      <div class="toolbar">
        <span>订单管理</span>
        <div class="filters">
          <el-select v-model="query.status" style="width: 120px" @change="onSearch">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-input
            v-model="query.orderNo"
            placeholder="订单号"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
          <el-button type="primary" @click="onSearch">查询</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="orderNo" label="订单号" min-width="180" />
      <el-table-column prop="userPhone" label="用户手机" width="120" />
      <el-table-column label="商品" min-width="180">
        <template #default="{ row }">
          <div v-for="(item, idx) in row.items" :key="idx" class="item-line">
            {{ item.title }} x{{ item.quantity }}
          </div>
          <span v-if="row.itemCount > row.items.length" class="more">等 {{ row.itemCount }} 件</span>
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付" width="90">
        <template #default="{ row }">¥{{ row.payAmount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="fundDeductAmount" label="贡献金抵扣" width="100">
        <template #default="{ row }">¥{{ row.fundDeductAmount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="accruedFund" label="累计贡献金" width="100" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'paid' ? 'warning' : row.status === 'shipped' ? 'primary' : 'info'">
            {{ statusMap[row.status] ?? row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'paid'" link type="success" @click="onShip(row)">发货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="query.pageSize"
        :current-page="query.page"
        @current-change="onPageChange"
      />
    </div>
  </el-card>

  <el-dialog v-model="detailVisible" title="订单详情" width="720px">
    <div v-loading="detailLoading">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusMap[detail.status] ?? detail.status }}</el-descriptions-item>
          <el-descriptions-item label="用户手机">{{ detail.userPhone }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ detail.payMethod ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品总额">¥{{ detail.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">¥{{ detail.payAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="贡献金抵扣">¥{{ detail.fundDeductAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="累计贡献金">{{ detail.accruedFund }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatTime(detail.paidAt) }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ formatTime(detail.shippedAt) }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ detail.address.receiver }} {{ detail.address.phone }}
            {{ detail.address.province }}{{ detail.address.city }}{{ detail.address.district }}{{ detail.address.detail }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table :data="detail.items" border style="margin-top: 16px">
          <el-table-column prop="title" label="商品" />
          <el-table-column label="规格" min-width="120">
            <template #default="{ row }">
              {{ row.spec ? Object.values(row.spec).join(' / ') : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="90">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" />
          <el-table-column prop="itemFund" label="贡献金" width="90" />
        </el-table>
      </template>
    </div>
    <template #footer>
      <el-button @click="detailVisible = false">关闭</el-button>
      <el-button v-if="detail?.status === 'paid'" type="primary" @click="detail && onShip(detail)">
        确认发货
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.filters {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.item-line {
  line-height: 1.5;
}
.more {
  color: #909399;
  font-size: 12px;
}
</style>
