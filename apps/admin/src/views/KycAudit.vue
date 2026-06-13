<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { auditAdminKyc, fetchAdminKycList, type AdminKycItem } from '@/api/kyc';

const loading = ref(false);
const list = ref<AdminKycItem[]>([]);
const total = ref(0);

const query = reactive({
  status: 'pending',
  page: 1,
  pageSize: 20,
});

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'passed' },
  { label: '已驳回', value: 'rejected' },
  { label: '全部', value: 'all' },
];

const statusMap: Record<string, string> = {
  pending: '待审核',
  passed: '已通过',
  rejected: '已驳回',
};

function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminKycList({
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

async function onPass(row: AdminKycItem) {
  await ElMessageBox.confirm(`确认通过 ${row.realName}（${row.phone}）的实名认证？`, '审核通过', {
    type: 'warning',
  });
  await auditAdminKyc(row.id, { action: 'pass' });
  ElMessage.success('已通过');
  await loadData();
}

async function onReject(row: AdminKycItem) {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回认证', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '请填写驳回原因',
  });
  await auditAdminKyc(row.id, { action: 'reject', reason: value });
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
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="realName" label="姓名" width="100" />
      <el-table-column prop="idCardNo" label="身份证号" min-width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">{{ statusMap[row.status] ?? row.status }}</template>
      </el-table-column>
      <el-table-column prop="rejectReason" label="驳回原因" min-width="120" />
      <el-table-column label="提交时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="审核时间" width="170">
        <template #default="{ row }">{{ formatTime(row.auditedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button link type="primary" @click="onPass(row)">通过</el-button>
            <el-button link type="danger" @click="onReject(row)">驳回</el-button>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !list.length" description="暂无认证记录" />

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
