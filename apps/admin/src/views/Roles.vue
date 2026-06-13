<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createRole,
  fetchRoles,
  updateRole,
  type PermissionOption,
  type RoleItem,
} from '@/api/admin';

const loading = ref(false);
const saving = ref(false);
const list = ref<RoleItem[]>([]);
const permissionOptions = ref<PermissionOption[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  name: '',
  permissions: [] as string[],
  dataScope: 'all',
});

function resetForm() {
  form.name = '';
  form.permissions = [];
  form.dataScope = 'all';
  editingId.value = null;
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchRoles();
    list.value = res.list;
    permissionOptions.value = res.permissionOptions;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(row: RoleItem) {
  editingId.value = row.id;
  form.name = row.name;
  form.permissions = [...row.permissions];
  form.dataScope = row.dataScope ?? 'all';
  dialogVisible.value = true;
}

async function onSave() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入角色名称');
    return;
  }
  if (!form.permissions.length) {
    ElMessage.warning('请至少选择一个权限');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      permissions: form.permissions,
      dataScope: form.dataScope,
    };
    if (editingId.value) {
      await updateRole(editingId.value, payload);
      ElMessage.success('角色已更新');
    } else {
      await createRole(payload);
      ElMessage.success('角色已创建');
    }
    dialogVisible.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <el-card v-loading="loading">
    <div style="margin-bottom: 12px">
      <el-button type="primary" @click="openCreate">新增角色</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column prop="name" label="角色名称" width="160" />
      <el-table-column label="权限">
        <template #default="{ row }">
          <el-tag v-for="item in row.permissions" :key="item" size="small" style="margin: 2px">
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dataScope" label="数据范围" width="120" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑角色' : '新增角色'"
      width="520px"
      @closed="resetForm"
    >
      <el-form label-width="90px">
        <el-form-item label="角色名称">
          <el-input v-model="form.name" placeholder="如：运营" />
        </el-form-item>
        <el-form-item label="数据范围">
          <el-input v-model="form.dataScope" placeholder="all" />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox
              v-for="item in permissionOptions"
              :key="item.key"
              :label="item.key"
              style="display: block; margin: 4px 0"
            >
              {{ item.label }}（{{ item.key }}）
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
