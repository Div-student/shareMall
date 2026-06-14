<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  fetchAdminCoupons,
  saveAdminCoupon,
  toggleCouponStatus,
  type CouponItem,
} from '@/api/operations';

const loading = ref(false);
const list = ref<CouponItem[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  name: '',
  type: 'fixed' as 'fixed' | 'discount',
  value: 5,
  minAmount: 0,
  total: 100,
  status: 'enabled' as 'enabled' | 'disabled',
  startAt: '',
  endAt: '',
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAdminCoupons();
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { name: '', type: 'fixed', value: 5, minAmount: 0, total: 100, status: 'enabled', startAt: '', endAt: '' });
  dialogVisible.value = true;
}

function openEdit(row: CouponItem) {
  editingId.value = row.id;
  Object.assign(form, row);
  dialogVisible.value = true;
}

async function onSave() {
  await saveAdminCoupon(form, editingId.value ?? undefined);
  ElMessage.success('保存成功');
  dialogVisible.value = false;
  await load();
}

async function onToggle(row: CouponItem) {
  const status = row.status === 'enabled' ? 'disabled' : 'enabled';
  await toggleCouponStatus(row.id, status);
  ElMessage.success('状态已更新');
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <el-button type="primary" style="margin-bottom: 12px" @click="openCreate">新增优惠券</el-button>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="type" label="类型" width="90">
        <template #default="{ row }">{{ row.type === 'fixed' ? '满减' : '折扣' }}</template>
      </el-table-column>
      <el-table-column prop="value" label="面额/折扣" width="100" />
      <el-table-column prop="minAmount" label="门槛" width="90" />
      <el-table-column label="领取/总量" width="110">
        <template #default="{ row }">{{ row.claimed }}/{{ row.total || '∞' }}</template>
      </el-table-column>
      <el-table-column prop="used" label="已核销" width="80" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">{{ row.status === 'enabled' ? '启用' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link @click="onToggle(row)">{{ row.status === 'enabled' ? '停用' : '启用' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑优惠券' : '新增优惠券'" width="520px">
      <el-form label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="满减券" value="fixed" />
            <el-option label="折扣券" value="discount" />
          </el-select>
        </el-form-item>
        <el-form-item :label="form.type === 'fixed' ? '减免金额' : '折扣(0.9=9折)'">
          <el-input-number v-model="form.value" :min="0" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用门槛"><el-input-number v-model="form.minAmount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="发放总量"><el-input-number v-model="form.total" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="开始时间"><el-date-picker v-model="form.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /></el-form-item>
        <el-form-item label="结束时间"><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
