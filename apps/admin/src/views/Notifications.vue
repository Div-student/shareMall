<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { broadcastNotification, fetchAdminNotifications } from '@/api/operations';

const loading = ref(false);
const list = ref<Array<Record<string, unknown>>>([]);
const form = reactive({
  title: '',
  content: '',
  type: 'system' as 'system' | 'order' | 'trade',
  target: 'all' as 'all' | 'phones',
  phonesText: '',
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminNotifications({ page: 1 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function onBroadcast() {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  const phones =
    form.target === 'phones'
      ? form.phonesText.split(/[\s,，]+/).filter(Boolean)
      : undefined;
  const res = await broadcastNotification({
    title: form.title,
    content: form.content,
    type: form.type,
    target: form.target,
    phones,
  });
  ElMessage.success(`已发送 ${(res as { count?: number }).count ?? 0} 条`);
  form.title = '';
  form.content = '';
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <el-card header="广播通知" style="margin-bottom: 16px">
      <el-form label-width="90px" style="max-width: 560px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 160px">
            <el-option label="系统" value="system" />
            <el-option label="订单" value="order" />
            <el-option label="交易" value="trade" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标">
          <el-radio-group v-model="form.target">
            <el-radio value="all">全部用户</el-radio>
            <el-radio value="phones">指定手机号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.target === 'phones'" label="手机号">
          <el-input v-model="form.phonesText" placeholder="多个手机号用逗号分隔" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBroadcast">发送</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card header="最近通知记录">
      <el-table v-loading="loading" :data="list" border>
        <el-table-column prop="title" label="标题" min-width="140" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="170" />
      </el-table>
    </el-card>
  </div>
</template>
