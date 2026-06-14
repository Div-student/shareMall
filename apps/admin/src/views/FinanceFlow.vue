<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  fetchFinanceFlow,
  type FinanceFlowCategory,
} from '@/api/finance';

const loading = ref(false);
const list = ref<Record<string, unknown>[]>([]);
const total = ref(0);

const query = reactive({
  category: 'fund' as FinanceFlowCategory,
  dateRange: [] as string[],
  page: 1,
  pageSize: 20,
});

const categoryOptions = [
  { label: '贡献金流水', value: 'fund' },
  { label: '支付流水', value: 'payment' },
  { label: '提现流水', value: 'withdraw' },
  { label: '藏品成交', value: 'nft' },
];

const changeTypeMap: Record<string, string> = {
  order_accrue: '确认收货累计',
  checkin_start: '开启打卡',
  checkin_cashout: '打卡兑现',
  order_deduct: '下单抵扣',
  nft_exchange: '藏品兑换',
  nft_trade_buy: '藏品买入',
  nft_trade_income: '藏品卖出',
  aftersale_void: '售后冲销',
  aftersale_rollback: '售后回退',
  withdraw: '提现',
  task_reward: '任务奖励',
};

function formatTime(value?: string | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function buildParams() {
  const params: Record<string, string | number> = {
    category: query.category,
    page: query.page,
    pageSize: query.pageSize,
  };
  if (query.dateRange.length === 2) {
    params.startDate = query.dateRange[0];
    params.endDate = query.dateRange[1];
  }
  return params;
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchFinanceFlow(buildParams());
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

onMounted(loadData);
</script>

<template>
  <div>
    <el-form :inline="true" @submit.prevent="onSearch">
      <el-form-item label="类型">
        <el-select v-model="query.category" style="width: 140px" @change="onSearch">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 260px"
        />
      </el-form-item>
      <el-button type="primary" @click="onSearch">查询</el-button>
    </el-form>

    <el-table v-if="query.category === 'fund'" v-loading="loading" :data="list" border>
      <el-table-column prop="userPhone" label="用户" width="120" />
      <el-table-column prop="changeType" label="变动类型" width="130">
        <template #default="{ row }">
          {{ changeTypeMap[row.changeType as string] ?? row.changeType }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="100" />
      <el-table-column prop="balanceAfter" label="余额" width="100" />
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt as string) }}</template>
      </el-table-column>
    </el-table>

    <el-table v-else-if="query.category === 'payment'" v-loading="loading" :data="list" border>
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="channel" label="渠道" width="90" />
      <el-table-column prop="tradeNo" label="交易号" min-width="180" />
      <el-table-column prop="amount" label="金额" width="100" />
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column prop="createdAt" label="时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt as string) }}</template>
      </el-table-column>
    </el-table>

    <el-table v-else-if="query.category === 'withdraw'" v-loading="loading" :data="list" border>
      <el-table-column prop="userPhone" label="用户" width="120" />
      <el-table-column prop="amount" label="申请金额" width="100" />
      <el-table-column prop="fee" label="手续费" width="90" />
      <el-table-column prop="actualAmount" label="到账金额" width="100" />
      <el-table-column prop="method" label="方式" width="90" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="createdAt" label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt as string) }}</template>
      </el-table-column>
    </el-table>

    <el-table v-else v-loading="loading" :data="list" border>
      <el-table-column prop="buyerPhone" label="买家" width="120" />
      <el-table-column prop="sellerPhone" label="卖家" width="120" />
      <el-table-column prop="price" label="成交价" width="100" />
      <el-table-column prop="fee" label="手续费" width="90" />
      <el-table-column prop="sellerIncome" label="卖家到账" width="100" />
      <el-table-column prop="tradedAt" label="成交时间" width="170">
        <template #default="{ row }">{{ formatTime(row.tradedAt as string) }}</template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > query.pageSize"
      style="margin-top: 16px"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="query.pageSize"
      :current-page="query.page"
      @current-change="onPageChange"
    />
  </div>
</template>
