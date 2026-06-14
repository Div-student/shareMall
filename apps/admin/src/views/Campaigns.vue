<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  fetchAdminCampaigns,
  saveAdminCampaign,
  setCampaignStatus,
  type CampaignItem,
} from '@/api/operations';

const loading = ref(false);
const list = ref<CampaignItem[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  title: '',
  subtitle: '',
  banner: '',
  content: '',
  type: 'general',
  status: 'draft' as 'draft' | 'active' | 'ended',
  startAt: '',
  endAt: '',
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminCampaigns();
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { title: '', subtitle: '', banner: '', content: '', type: 'general', status: 'draft', startAt: '', endAt: '' });
  dialogVisible.value = true;
}

function openEdit(row: CampaignItem) {
  editingId.value = row.id;
  Object.assign(form, row);
  dialogVisible.value = true;
}

async function onSave() {
  await saveAdminCampaign(form, editingId.value ?? undefined);
  ElMessage.success('保存成功');
  dialogVisible.value = false;
  await load();
}

async function onStatus(row: CampaignItem, status: 'draft' | 'active' | 'ended') {
  await setCampaignStatus(row.id, status);
  ElMessage.success('状态已更新');
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <el-button type="primary" style="margin-bottom: 12px" @click="openCreate">新增活动</el-button>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          {{ row.status === 'active' ? '进行中' : row.status === 'ended' ? '已结束' : '草稿' }}
        </template>
      </el-table-column>
      <el-table-column prop="participantCount" label="参与人次" width="100" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.status !== 'active'" link @click="onStatus(row, 'active')">上线</el-button>
          <el-button v-if="row.status === 'active'" link @click="onStatus(row, 'ended')">结束</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑活动' : '新增活动'" width="560px">
      <el-form label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="form.subtitle" /></el-form-item>
        <el-form-item label="Banner"><el-input v-model="form.banner" placeholder="图片 URL" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="通用" value="general" />
            <el-option label="促销" value="promotion" />
            <el-option label="折扣" value="discount" />
            <el-option label="藏品" value="nft" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始"><el-date-picker v-model="form.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /></el-form-item>
        <el-form-item label="结束"><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
