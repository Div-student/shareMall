<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchCheckinMonitor } from '@/api/operations';

const loading = ref(false);
const list = ref<Array<Record<string, unknown>>>([]);
const total = ref(0);
const query = reactive({ status: 'active', page: 1 });

const statusMap: Record<string, string> = {
  active: '进行中',
  completed: '已完成',
  terminated: '已终止',
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchCheckinMonitor({ status: query.status, page: query.page });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <el-form :inline="true" @submit.prevent="load">
      <el-form-item label="状态">
        <el-select v-model="query.status" style="width: 140px" @change="load">
          <el-option label="进行中" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已终止" value="terminated" />
          <el-option label="全部" value="all" />
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="load">刷新</el-button>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="userPhone" label="用户" width="120" />
      <el-table-column prop="tier" label="档位" width="80" />
      <el-table-column prop="progress" label="进度" width="100" />
      <el-table-column prop="signedDays" label="已签天数" width="100" />
      <el-table-column prop="cashedAmount" label="已兑现" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">{{ statusMap[row.status as string] ?? row.status }}</template>
      </el-table-column>
      <el-table-column prop="startedAt" label="开始时间" width="170" />
    </el-table>
  </div>
</template>
