<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAdminAccount,
  fetchAdminAccounts,
  fetchRoles,
  updateAdminAccount,
  type AdminAccountItem,
  type RoleItem,
} from '@/api/admin';

const loading = ref(false);
const saving = ref(false);
const list = ref<AdminAccountItem[]>([]);
const roles = ref<RoleItem[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  username: '',
  password: '',
  roleId: null as number | null,
  status: 'enabled' as 'enabled' | 'disabled',
});

function resetForm() {
  form.username = '';
  form.password = '';
  form.roleId = roles.value[0]?.id ?? null;
  form.status = 'enabled';
  editingId.value = null;
}

async function loadData() {
  loading.value = true;
  try {
    const [accounts, roleRes] = await Promise.all([fetchAdminAccounts(), fetchRoles()]);
    list.value = accounts.list;
    roles.value = roleRes.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(row: AdminAccountItem) {
  editingId.value = row.id;
  form.username = row.username;
  form.password = '';
  form.roleId = row.roleId;
  form.status = row.status;
  dialogVisible.value = true;
}

async function onSave() {
  if (!editingId.value && !form.username.trim()) {
    ElMessage.warning('请输入账号');
    return;
  }
  if (!editingId.value && form.password.length < 6) {
    ElMessage.warning('密码至少 6 位');
    return;
  }
  if (!form.roleId) {
    ElMessage.warning('请选择角色');
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      await updateAdminAccount(editingId.value, {
        roleId: form.roleId,
        status: form.status,
        password: form.password || undefined,
      });
      ElMessage.success('账号已更新');
    } else {
      await createAdminAccount({
        username: form.username.trim(),
        password: form.password,
        roleId: form.roleId,
      });
      ElMessage.success('账号已创建');
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
      <el-button type="primary" @click="openCreate">新增账号</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column prop="username" label="账号" width="160" />
      <el-table-column prop="roleName" label="角色" width="140" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑账号' : '新增账号'"
      width="480px"
      @closed="resetForm"
    >
      <el-form label-width="90px">
        <el-form-item label="账号">
          <el-input v-model="form.username" :disabled="Boolean(editingId)" placeholder="登录账号" />
        </el-form-item>
        <el-form-item :label="editingId ? '新密码' : '密码'">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改' : '至少 6 位'"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleId" placeholder="选择角色" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editingId" label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
