<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchAdminUserDetail, fetchAdminUsers, type AdminUserDetail, type AdminUserItem } from '@/api/user';

const loading = ref(false);
const list = ref<AdminUserItem[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const detail = ref<AdminUserDetail | null>(null);

const query = reactive({
  keyword: '',
  page: 1,
  pageSize: 20,
});

const kycMap: Record<string, string> = {
  none: '未认证',
  pending: '审核中',
  passed: '已通过',
  rejected: '已驳回',
};

function formatTime(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminUsers({
      keyword: query.keyword || undefined,
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
  void load();
}

function onPageChange(page: number) {
  query.page = page;
  void load();
}

async function openDetail(row: AdminUserItem) {
  detail.value = await fetchAdminUserDetail(row.id);
  detailVisible.value = true;
}

onMounted(load);
</script>

<template>
  <el-card>
    <el-form :inline="true" @submit.prevent="onSearch">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="手机号 / 昵称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column label="实名状态" width="100">
        <template #default="{ row }">{{ kycMap[row.kycStatus] ?? row.kycStatus }}</template>
      </el-table-column>
      <el-table-column prop="availableFund" label="可用贡献金" width="110" />
      <el-table-column prop="withdrawableCash" label="提现金" width="100" />
      <el-table-column label="注册时间" min-width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="query.page"
        :page-size="query.pageSize"
        @current-change="onPageChange"
      />
    </div>

    <el-drawer v-model="detailVisible" title="用户详情" size="420px">
      <template v-if="detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detail.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邀请码">{{ detail.inviteCode }}</el-descriptions-item>
          <el-descriptions-item label="邀请人">{{ detail.inviterPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="已邀请人数">{{ detail.invitedCount }}</el-descriptions-item>
          <el-descriptions-item label="实名状态">{{ kycMap[detail.kycStatus] ?? detail.kycStatus }}</el-descriptions-item>
          <el-descriptions-item label="待兑现贡献金">{{ detail.fund.pendingFund }}</el-descriptions-item>
          <el-descriptions-item label="可用贡献金">{{ detail.fund.availableFund }}</el-descriptions-item>
          <el-descriptions-item label="提现金">{{ detail.fund.withdrawableCash }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="最近登录">{{ formatTime(detail.lastLoginAt) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </el-card>
</template>
