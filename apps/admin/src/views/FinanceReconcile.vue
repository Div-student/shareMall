<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchFinanceReconcile, type ReconcileItem } from '@/api/finance';

const loading = ref(false);
const items = ref<ReconcileItem[]>([]);
const period = ref({ startDate: '', endDate: '' });

const query = reactive({
  dateRange: [] as string[],
});

const statusMap = {
  matched: { label: '一致', type: 'success' as const },
  diff: { label: '差异', type: 'danger' as const },
};

async function loadData() {
  loading.value = true;
  try {
    const params: Record<string, string> = {};
    if (query.dateRange.length === 2) {
      params.startDate = query.dateRange[0];
      params.endDate = query.dateRange[1];
    }
    const res = await fetchFinanceReconcile(params);
    items.value = res.items;
    period.value = res.period;
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div v-loading="loading">
    <el-form :inline="true" @submit.prevent="loadData">
      <el-form-item label="对账周期">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 260px"
        />
      </el-form-item>
      <el-button type="primary" @click="loadData">对账</el-button>
    </el-form>

    <el-alert
      title="平台内部对账：比对支付流水、提现打款、贡献金发放等系统记录是否一致。"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    />

    <div class="period">对账周期：{{ period.startDate }} ~ {{ period.endDate }}</div>

    <el-table :data="items" border>
      <el-table-column prop="title" label="对账项" width="160" />
      <el-table-column prop="description" label="说明" min-width="220" />
      <el-table-column prop="platformAmount" label="平台记录" width="120">
        <template #default="{ row }">{{ row.platformAmount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="referenceAmount" label="参照金额" width="120">
        <template #default="{ row }">{{ row.referenceAmount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="diff" label="差异" width="100">
        <template #default="{ row }">
          <span :class="{ diff: row.status === 'diff' }">{{ row.diff.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status].type">{{ statusMap[row.status].label }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.period {
  margin-bottom: 16px;
  color: #606266;
}
.diff {
  color: #f56c6c;
  font-weight: 600;
}
</style>
