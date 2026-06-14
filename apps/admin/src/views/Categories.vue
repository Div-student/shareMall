<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from '@/api/product';

const loading = ref(false);
const list = ref<AdminCategory[]>([]);
const dialogVisible = ref(false);
const form = reactive({
  name: '',
  parentId: 0,
  icon: '',
  fundRatio: undefined as number | undefined,
  sort: 0,
});

const parentOptions = computed(() => [
  { label: '一级分类', value: 0 },
  ...list.value
    .filter((item) => item.parentId === 0)
    .map((item) => ({ label: item.name, value: item.id })),
]);

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminCategories();
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  Object.assign(form, { name: '', parentId: 0, icon: '', fundRatio: undefined, sort: 0 });
  dialogVisible.value = true;
}

async function onCreate() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }
  await createAdminCategory({
    name: form.name.trim(),
    parentId: form.parentId || undefined,
    icon: form.icon || undefined,
    fundRatio: form.fundRatio,
    sort: form.sort,
  });
  ElMessage.success('创建成功');
  dialogVisible.value = false;
  await load();
}

async function onToggleStatus(row: AdminCategory) {
  const status = row.status === 'show' ? 'hidden' : 'show';
  await updateAdminCategory(row.id, { status });
  ElMessage.success('状态已更新');
  await load();
}

function parentName(parentId: number) {
  if (!parentId) return '一级';
  return list.value.find((item) => item.id === parentId)?.name ?? String(parentId);
}

onMounted(load);
</script>

<template>
  <el-card>
    <div style="margin-bottom: 12px">
      <el-button type="primary" @click="openCreate">新增分类</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column label="上级" width="120">
        <template #default="{ row }">{{ parentName(row.parentId) }}</template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="贡献金比例" width="120">
        <template #default="{ row }">{{ row.fundRatio ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'show' ? 'success' : 'info'">
            {{ row.status === 'show' ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="onToggleStatus(row)">
            {{ row.status === 'show' ? '隐藏' : '显示' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增分类" width="480px">
      <el-form label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="form.parentId" style="width: 100%">
            <el-option v-for="item in parentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标 URL">
          <el-input v-model="form.icon" placeholder="可选" />
        </el-form-item>
        <el-form-item label="贡献金比例">
          <el-input-number v-model="form.fundRatio" :min="0" :max="1" :step="0.01" :precision="4" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onCreate">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
