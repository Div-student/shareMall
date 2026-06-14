<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  fetchFinanceReports,
  type FinanceReportType,
} from '@/api/finance';

const loading = ref(false);
const report = ref<Awaited<ReturnType<typeof fetchFinanceReports>> | null>(null);

const query = reactive({
  type: 'trade' as FinanceReportType,
  dateRange: [] as string[],
});

const typeOptions = [
  { label: '交易报表', value: 'trade' },
  { label: '贡献金报表', value: 'fund' },
  { label: '提现报表', value: 'withdraw' },
  { label: '藏品交易报表', value: 'nft' },
];

const summaryCards = computed(() => {
  const summary = report.value?.summary ?? {};
  if (query.type === 'trade') {
    return [
      { label: '支付订单数', value: summary.orderCount ?? 0 },
      { label: 'GMV', value: (summary.gmv ?? 0).toFixed(2) },
      { label: '客单价', value: (summary.avgOrderAmount ?? 0).toFixed(2) },
      { label: '贡献金抵扣', value: (summary.fundDeduct ?? 0).toFixed(2) },
      { label: '退款笔数', value: summary.refundCount ?? 0 },
      { label: '退款金额', value: (summary.refundAmount ?? 0).toFixed(2) },
      { label: '净 GMV', value: (summary.netGmv ?? 0).toFixed(2) },
    ];
  }
  if (query.type === 'fund') {
    return [
      { label: '确认收货发放', value: (summary.orderAccrue ?? 0).toFixed(2) },
      { label: '打卡兑现', value: (summary.checkinCashout ?? 0).toFixed(2) },
      { label: '下单抵扣', value: (summary.orderDeduct ?? 0).toFixed(2) },
      { label: '任务奖励', value: (summary.taskReward ?? 0).toFixed(2) },
      { label: '售后冲销', value: (summary.aftersaleVoid ?? 0).toFixed(2) },
      { label: '藏品兑换', value: (summary.nftExchange ?? 0).toFixed(2) },
    ];
  }
  if (query.type === 'withdraw') {
    return [
      { label: '申请笔数', value: summary.applyCount ?? 0 },
      { label: '申请金额', value: (summary.applyAmount ?? 0).toFixed(2) },
      { label: '已打款笔数', value: summary.paidCount ?? 0 },
      { label: '已打款金额', value: (summary.paidAmount ?? 0).toFixed(2) },
      { label: '待审核笔数', value: summary.pendingCount ?? 0 },
      { label: '手续费合计', value: (summary.feeTotal ?? 0).toFixed(2) },
    ];
  }
  return [
    { label: '成交笔数', value: summary.tradeCount ?? 0 },
    { label: '成交额', value: (summary.tradeVolume ?? 0).toFixed(2) },
    { label: '手续费收入', value: (summary.feeIncome ?? 0).toFixed(2) },
    { label: '卖家到账', value: (summary.sellerIncome ?? 0).toFixed(2) },
  ];
});

async function loadData() {
  loading.value = true;
  try {
    const params: Record<string, string> = { type: query.type };
    if (query.dateRange.length === 2) {
      params.startDate = query.dateRange[0];
      params.endDate = query.dateRange[1];
    }
    report.value = await fetchFinanceReports(params);
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div v-loading="loading">
    <el-form :inline="true" @submit.prevent="loadData">
      <el-form-item label="报表类型">
        <el-select v-model="query.type" style="width: 160px" @change="loadData">
          <el-option
            v-for="item in typeOptions"
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
      <el-button type="primary" @click="loadData">查询</el-button>
    </el-form>

    <div v-if="report" class="period">
      统计周期：{{ report.period.startDate }} ~ {{ report.period.endDate }}
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col v-for="card in summaryCards" :key="card.label" :span="6" style="margin-bottom: 12px">
        <el-card shadow="hover">
          <div class="label">{{ card.label }}</div>
          <div class="value">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>每日明细</template>
      <el-table :data="report?.daily ?? []" border size="small">
        <el-table-column prop="date" label="日期" width="120" />
        <template v-if="query.type === 'trade'">
          <el-table-column prop="orderCount" label="订单数" />
          <el-table-column prop="gmv" label="GMV" />
          <el-table-column prop="refundAmount" label="退款" />
        </template>
        <template v-else-if="query.type === 'fund'">
          <el-table-column prop="accrue" label="发放" />
          <el-table-column prop="cashout" label="兑现" />
          <el-table-column prop="deduct" label="抵扣" />
        </template>
        <template v-else-if="query.type === 'withdraw'">
          <el-table-column prop="applyCount" label="申请笔数" />
          <el-table-column prop="applyAmount" label="申请金额" />
          <el-table-column prop="paidAmount" label="打款金额" />
        </template>
        <template v-else>
          <el-table-column prop="tradeCount" label="成交笔数" />
          <el-table-column prop="tradeVolume" label="成交额" />
          <el-table-column prop="feeIncome" label="手续费" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.period {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}
.label {
  color: #909399;
  font-size: 13px;
}
.value {
  font-size: 20px;
  font-weight: 600;
  margin-top: 8px;
}
</style>
