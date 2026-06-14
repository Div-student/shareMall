<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/api/request';

interface AdminReview {
  id: number;
  orderNo: string;
  userPhone: string;
  rating: number;
  content: string;
  status: 'shown' | 'hidden';
  adminReply?: string | null;
  createdAt: string;
}

const loading = ref(false);
const list = ref<AdminReview[]>([]);
const query = ref({ status: 'all' as 'all' | 'shown' | 'hidden', page: 1 });

async function load() {
  loading.value = true;
  try {
    const res = await request.get<unknown, { list: AdminReview[]; total: number }>('/admin/reviews', {
      params: query.value,
    });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function audit(row: AdminReview, status: 'shown' | 'hidden') {
  await request.post(`/admin/reviews/${row.id}/audit`, { status });
  ElMessage.success(status === 'shown' ? '已显示' : '已隐藏');
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <el-form :inline="true" @submit.prevent="load">
      <el-form-item label="状态">
        <el-select v-model="query.status" style="width: 140px" @change="load">
          <el-option label="全部" value="all" />
          <el-option label="显示中" value="shown" />
          <el-option label="已隐藏" value="hidden" />
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="load">查询</el-button>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="userPhone" label="用户" width="120" />
      <el-table-column prop="rating" label="评分" width="80" />
      <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          {{ row.status === 'shown' ? '显示' : '隐藏' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'hidden'" link type="primary" @click="audit(row, 'shown')">
            显示
          </el-button>
          <el-button v-else link type="danger" @click="audit(row, 'hidden')">隐藏</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
