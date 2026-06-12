<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  type AdminCategory,
  type AdminProduct,
} from '@/api/product';

const loading = ref(false);
const list = ref<AdminProduct[]>([]);
const categories = ref<AdminCategory[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  title: '',
  categoryId: undefined as number | undefined,
  mainImage: '',
  price: 0,
  fundRatio: 0.1,
  status: 'on_sale' as 'on_sale' | 'off_shelf',
});

async function loadData() {
  loading.value = true;
  try {
    const [productRes, categoryRes] = await Promise.all([
      fetchAdminProducts({ page: 1, pageSize: 50 }),
      fetchAdminCategories(),
    ]);
    list.value = productRes.list;
    categories.value = categoryRes.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.title = '';
  form.categoryId = categories.value[0]?.id;
  form.mainImage = 'https://picsum.photos/seed/new/400';
  form.price = 99;
  form.fundRatio = 0.1;
  form.status = 'on_sale';
  dialogVisible.value = true;
}

function openEdit(row: AdminProduct) {
  editingId.value = row.id;
  form.title = row.title;
  form.categoryId = row.categoryId;
  form.mainImage = row.mainImage;
  form.price = row.price;
  form.fundRatio = row.fundRatio ?? 0.1;
  form.status = row.status;
  dialogVisible.value = true;
}

async function onSubmit() {
  if (!form.title || !form.categoryId || !form.mainImage) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  const payload = {
    title: form.title,
    categoryId: form.categoryId,
    mainImage: form.mainImage,
    price: form.price,
    fundRatio: form.fundRatio,
    status: form.status,
  };
  if (editingId.value) {
    await updateAdminProduct(editingId.value, payload);
    ElMessage.success('更新成功');
  } else {
    await createAdminProduct(payload);
    ElMessage.success('创建成功');
  }
  dialogVisible.value = false;
  await loadData();
}

onMounted(loadData);
</script>

<template>
  <el-card v-loading="loading">
    <el-button type="primary" style="margin-bottom: 16px" @click="openCreate">新增商品</el-button>
    <el-table :data="list" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="商品名称" min-width="160" />
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column prop="price" label="价格" width="90" />
      <el-table-column label="贡献金比例" width="110">
        <template #default="{ row }">{{ row.fundRatio != null ? `${(row.fundRatio * 100).toFixed(0)}%` : '默认' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on_sale' ? 'success' : 'info'">
            {{ row.status === 'on_sale' ? '在售' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !list.length" description="暂无商品" />
  </el-card>

  <el-dialog v-model="dialogVisible" :title="editingId ? '编辑商品' : '新增商品'" width="520px">
    <el-form label-width="90px">
      <el-form-item label="商品名称">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="主图 URL">
        <el-input v-model="form.mainImage" />
      </el-form-item>
      <el-form-item label="价格">
        <el-input-number v-model="form.price" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="贡献金比例">
        <el-input-number v-model="form.fundRatio" :min="0" :max="1" :step="0.01" :precision="2" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="on_sale">在售</el-radio>
          <el-radio value="off_shelf">下架</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
