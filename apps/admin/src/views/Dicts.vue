<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  deleteAdminDict,
  fetchAdminDicts,
  saveAdminDict,
  type DictItem,
} from '@/api/operations';

const loading = ref(false);
const list = ref<DictItem[]>([]);
const query = reactive({ group: '' });
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  group: '',
  code: '',
  label: '',
  sort: 0,
  status: 'enabled' as 'enabled' | 'disabled',
  remark: '',
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminDicts({ group: query.group || undefined });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { group: query.group || '', code: '', label: '', sort: 0, status: 'enabled', remark: '' });
  dialogVisible.value = true;
}

function openEdit(row: DictItem) {
  editingId.value = row.id;
  Object.assign(form, row);
  dialogVisible.value = true;
}

async function onSave() {
  await saveAdminDict(form, editingId.value ?? undefined);
  ElMessage.success('保存成功');
  dialogVisible.value = false;
  await load();
}

async function onDelete(row: DictItem) {
  await ElMessageBox.confirm(`确认删除 ${row.group}/${row.code}？`, '提示');
  await deleteAdminDict(row.id);
  ElMessage.success('已删除');
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <el-form :inline="true" @submit.prevent="load">
      <el-form-item label="分组">
        <el-input v-model="query.group" placeholder="order_status" clearable style="width: 180px" />
      </el-form-item>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="openCreate">新增</el-button>
    </el-form>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="group" label="分组" width="140" />
      <el-table-column prop="code" label="编码" width="120" />
      <el-table-column prop="label" label="显示名" min-width="140" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">{{ row.status === 'enabled' ? '启用' : '停用' }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑字典' : '新增字典'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="分组"><el-input v-model="form.group" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="显示名"><el-input v-model="form.label" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
