<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  auditAdminAftersale,
  fetchAdminAftersaleList,
  type AdminAftersaleItem,
} from '@/api/aftersale';

const loading = ref(false);
const list = ref<AdminAftersaleItem[]>([]);
const total = ref(0);

const query = reactive({
  status: 'pending',
  page: 1,
  pageSize: 20,
});

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已退款', value: 'refunded' },
  { label: '已驳回', value: 'rejected' },
  { label: '全部', value: 'all' },
];

function formatTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminAftersaleList({
      status: query.status,
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

async function onPass(row: AdminAftersaleItem) {
  await ElMessageBox.confirm(
    `确认同意售后并 Mock 退款？\n订单：${row.orderNo}\n退款：${row.refundAmount} 元\n回退抵扣：${row.fundRollback} 元`,
    '售后审核',
    { type: 'warning' },
  );
  const res = await auditAdminAftersale(row.id, { action: 'pass' });
  ElMessage.success(
    `已退款，回退抵扣 ${res.fundRollback ?? 0} 元，冲销累计 ${res.fundVoid ?? 0} 元`,
  );
  await loadData();
}

async function onReject(row: AdminAftersaleItem) {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回售后', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '请填写驳回原因',
  });
  await auditAdminAftersale(row.id, { action: 'reject', reason: value });
  ElMessage.success('已驳回');
  await loadData();
}

onMounted(loadData);
</script>

<template>
  <el-card>
    <div class="toolbar">
      <el-select v-model="query.status" style="width: 140px" @change="onSearch">
        <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
      <el-button type="primary" @click="onSearch">查询</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border style="margin-top: 16px">
      <el-table-column prop="orderNo" label="订单号" min-width="160" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="typeLabel" label="类型" width="100" />
      <el-table-column prop="refundAmount" label="退款金额" width="100" />
      <el-table-column prop="fundRollback" label="回退抵扣" width="100" />
      <el-table-column prop="reason" label="原因" min-width="140" />
      <el-table-column prop="statusLabel" label="状态" width="90" />
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button link type="primary" @click="onPass(row)">同意</el-button>
            <el-button link type="danger" @click="onReject(row)">驳回</el-button>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !list.length" description="暂无售后申请" />

    <div v-if="total > query.pageSize" class="pager">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="query.pageSize"
        :current-page="query.page"
        @current-change="onPageChange"
      />
    </div>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
