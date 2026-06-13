<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { auditAdminWithdraw, fetchAdminWithdrawList, type AdminWithdrawItem } from '@/api/withdraw';

const loading = ref(false);
const list = ref<AdminWithdrawItem[]>([]);
const total = ref(0);

const query = reactive({
  status: 'pending',
  page: 1,
  pageSize: 20,
});

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已到账', value: 'paid' },
  { label: '已驳回', value: 'rejected' },
  { label: '全部', value: 'all' },
];

const statusMap: Record<string, string> = {
  pending: '待审核',
  auditing: '审核中',
  approved: '已通过',
  paying: '打款中',
  paid: '已到账',
  rejected: '已驳回',
  failed: '失败',
};

const kycMap: Record<string, string> = {
  none: '未认证',
  pending: '审核中',
  passed: '已认证',
  rejected: '已驳回',
};

function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function formatAccount(row: AdminWithdrawItem) {
  const info = row.accountInfo;
  if (row.method === 'bank') {
    return `${info.accountName} / ${info.bankName} / ${info.cardNo}`;
  }
  return `${info.accountName} / ${info.accountNo}`;
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminWithdrawList({
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

async function onPass(row: AdminWithdrawItem) {
  await ElMessageBox.confirm(
    `确认通过并 Mock 打款？\n用户：${row.phone}\n金额：${row.amount} 元\n预计到账：${row.actualAmount} 元`,
    '提现审核',
    { type: 'warning' },
  );
  await auditAdminWithdraw(row.id, { action: 'pass' });
  ElMessage.success('已通过并完成 Mock 打款');
  await loadData();
}

async function onReject(row: AdminWithdrawItem) {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回提现', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '请填写驳回原因',
  });
  await auditAdminWithdraw(row.id, { action: 'reject', reason: value });
  ElMessage.success('已驳回，提现金已退回');
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
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="实名" width="90">
        <template #default="{ row }">{{ kycMap[row.kycStatus] ?? row.kycStatus }}</template>
      </el-table-column>
      <el-table-column prop="amount" label="提现金额" width="100" />
      <el-table-column prop="actualAmount" label="预计到账" width="100" />
      <el-table-column prop="methodLabel" label="方式" width="80" />
      <el-table-column label="收款账户" min-width="200">
        <template #default="{ row }">{{ formatAccount(row) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">{{ statusMap[row.status] ?? row.status }}</template>
      </el-table-column>
      <el-table-column prop="rejectReason" label="驳回原因" min-width="120" />
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="到账时间" width="170">
        <template #default="{ row }">{{ formatTime(row.paidAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="['pending', 'auditing', 'approved', 'paying'].includes(row.status)">
            <el-button link type="primary" @click="onPass(row)">通过</el-button>
            <el-button link type="danger" @click="onReject(row)">驳回</el-button>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !list.length" description="暂无提现申请" />

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
