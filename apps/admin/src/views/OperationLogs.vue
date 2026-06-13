<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchOperationLogs, type OperationLogItem } from '@/api/admin';

const loading = ref(false);
const list = ref<OperationLogItem[]>([]);
const total = ref(0);

const query = reactive({
  module: '',
  page: 1,
  pageSize: 20,
});

const moduleOptions = [
  { label: '全部', value: '' },
  { label: '认证', value: 'auth' },
  { label: '角色', value: 'role' },
  { label: '账号', value: 'account' },
  { label: '订单', value: 'orders' },
  { label: '提现', value: 'withdraw' },
  { label: '售后', value: 'aftersale' },
  { label: '贡献金', value: 'fund' },
];

function formatTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchOperationLogs({
      module: query.module || undefined,
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

onMounted(loadData);
</script>

<template>
  <el-card>
    <el-form :inline="true" @submit.prevent="onSearch">
      <el-form-item label="模块">
        <el-select v-model="query.module" style="width: 160px">
          <el-option
            v-for="item in moduleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="adminId" label="管理员ID" width="100" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="action" label="动作" width="100" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column label="详情" min-width="220">
        <template #default="{ row }">
          <span class="detail">{{ JSON.stringify(row.detail ?? {}) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; text-align: right">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="query.page"
        :page-size="query.pageSize"
        @current-change="onPageChange"
      />
    </div>
  </el-card>
</template>

<style scoped>
.detail {
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}
</style>
