<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { fetchDashboardOverview, type DashboardOverview } from '@/api/admin';

const loading = ref(true);
const data = ref<DashboardOverview | null>(null);
const chartRef = ref<HTMLDivElement | null>(null);
let chart: ECharts | null = null;

const cards = computed(() => {
  const overview = data.value;
  if (!overview) return [];
  return [
    { label: 'GMV', value: overview.trade.gmv.toFixed(2) },
    { label: '支付订单数', value: String(overview.trade.orderCount) },
    { label: '客单价', value: overview.trade.avgOrderAmount.toFixed(2) },
    { label: '支付成功率', value: `${overview.trade.paymentSuccessRate}%` },
    { label: '用户总数', value: String(overview.user.total) },
    { label: '今日新增', value: String(overview.user.todayNew) },
    { label: '邀请总数', value: String(overview.user.inviteTotal) },
    { label: '待兑现贡献金', value: overview.fund.pendingTotal.toFixed(2) },
    { label: '可用贡献金', value: overview.fund.availableTotal.toFixed(2) },
    { label: '提现金余额', value: overview.fund.withdrawableTotal.toFixed(2) },
    { label: '抵扣消耗', value: overview.fund.deductTotal.toFixed(2) },
    { label: '打卡进行中', value: String(overview.fund.activeCheckinUsers) },
    { label: '待审核提现', value: overview.audit.pendingWithdrawAmount.toFixed(2) },
    { label: '待审核实名', value: String(overview.audit.pendingKycCount) },
    { label: '待处理售后', value: String(overview.audit.pendingAftersaleCount) },
  ];
});

function formatDateLabel(date: string) {
  const [, month, day] = date.split('-');
  return `${month}-${day}`;
}

function renderChart() {
  if (!chartRef.value) return;

  const trend = data.value?.trend ?? [];
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  chart.setOption({
    color: ['#409eff', '#67c23a'],
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['订单数', 'GMV'],
      top: 0,
    },
    grid: {
      left: 48,
      right: 48,
      top: 40,
      bottom: 28,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map((item) => formatDateLabel(item.date)),
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数',
        minInterval: 1,
      },
      {
        type: 'value',
        name: 'GMV',
        axisLabel: {
          formatter: (value: number) => `¥${value}`,
        },
      },
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: trend.map((item) => item.orderCount),
      },
      {
        name: 'GMV',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        data: trend.map((item) => Number(item.gmv)),
      },
    ],
  });
}

function handleResize() {
  chart?.resize();
}

async function load() {
  loading.value = true;
  try {
    data.value = await fetchDashboardOverview();
    await nextTick();
    renderChart();
  } finally {
    loading.value = false;
  }
}

watch(
  () => data.value?.trend,
  () => {
    renderChart();
  },
);

onMounted(() => {
  void load();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.label" :span="6" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <div class="label">{{ c.label }}</div>
          <div class="value">{{ c.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>近 7 日趋势</template>
      <div ref="chartRef" class="trend-chart" />
    </el-card>
  </div>
</template>

<style scoped>
.label {
  color: #909399;
  font-size: 13px;
}
.value {
  font-size: 22px;
  font-weight: 600;
  margin-top: 8px;
}
.trend-chart {
  width: 100%;
  height: 360px;
}
</style>
