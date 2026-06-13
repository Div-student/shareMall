<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAdminNft,
  fetchAdminNftMarket,
  fetchAdminNfts,
  updateAdminNft,
  updateAdminNftMarket,
  type AdminNft,
} from '@/api/nft';

const loading = ref(false);
const list = ref<AdminNft[]>([]);
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const marketForm = reactive({
  enabled: true,
  minPrice: 1,
  maxPrice: 99999,
  requireKyc: true,
  dailyFluctuationPct: 0.05,
  dealPremiumPct: 0.1,
  feeRate: 0.05,
});

const form = reactive({
  name: '',
  cover: '',
  publisher: 'ShareMall IP Lab',
  totalSupply: 100,
  startPrice: 10,
  limitPerUser: 0,
  rightsDesc: '',
  status: 'on_sale' as 'on_sale' | 'off_shelf',
  stock: undefined as number | undefined,
});

const statusText: Record<AdminNft['status'], string> = {
  on_sale: '上架',
  off_shelf: '下架',
};

async function loadData() {
  loading.value = true;
  try {
    const [productRes, market] = await Promise.all([
      fetchAdminNfts({ page: 1, pageSize: 100 }),
      fetchAdminNftMarket(),
    ]);
    list.value = productRes.list;
    marketForm.enabled = market.enabled;
    marketForm.minPrice = market.minPrice;
    marketForm.maxPrice = market.maxPrice;
    marketForm.requireKyc = market.requireKyc;
    marketForm.dailyFluctuationPct = market.dailyFluctuationPct;
    marketForm.dealPremiumPct = market.dealPremiumPct;
    marketForm.feeRate = market.feeRate;
  } finally {
    loading.value = false;
  }
}

async function saveMarket() {
  await updateAdminNftMarket({
    enabled: marketForm.enabled,
    minPrice: marketForm.minPrice,
    maxPrice: marketForm.maxPrice,
    requireKyc: marketForm.requireKyc,
    dailyFluctuationPct: marketForm.dailyFluctuationPct,
    dealPremiumPct: marketForm.dealPremiumPct,
  });
  ElMessage.success('市场配置已保存');
}

function openCreate() {
  editingId.value = null;
  form.name = '';
  form.cover = 'https://picsum.photos/seed/new-nft/400';
  form.publisher = 'ShareMall IP Lab';
  form.totalSupply = 100;
  form.startPrice = 10;
  form.limitPerUser = 0;
  form.rightsDesc = '';
  form.status = 'on_sale';
  form.stock = undefined;
  dialogVisible.value = true;
}

function openEdit(row: AdminNft) {
  editingId.value = row.id;
  form.name = row.name;
  form.cover = row.cover;
  form.publisher = row.publisher;
  form.totalSupply = row.totalSupply;
  form.startPrice = row.startPrice;
  form.limitPerUser = row.limitPerUser;
  form.rightsDesc = row.rightsDesc;
  form.status = row.status;
  form.stock = row.stock;
  dialogVisible.value = true;
}

async function onSubmit() {
  if (!form.name || !form.cover) {
    ElMessage.warning('请填写藏品名称与封面');
    return;
  }

  if (editingId.value) {
    await updateAdminNft(editingId.value, {
      name: form.name,
      cover: form.cover,
      publisher: form.publisher,
      startPrice: form.startPrice,
      limitPerUser: form.limitPerUser,
      rightsDesc: form.rightsDesc,
      status: form.status,
      stock: form.stock,
    });
    ElMessage.success('更新成功');
  } else {
    await createAdminNft({
      name: form.name,
      cover: form.cover,
      publisher: form.publisher,
      totalSupply: form.totalSupply,
      startPrice: form.startPrice,
      limitPerUser: form.limitPerUser,
      rightsDesc: form.rightsDesc,
      status: form.status,
    });
    ElMessage.success('发行成功');
  }

  dialogVisible.value = false;
  await loadData();
}

async function toggleStatus(row: AdminNft) {
  const next = row.status === 'on_sale' ? 'off_shelf' : 'on_sale';
  await updateAdminNft(row.id, { status: next });
  ElMessage.success(next === 'on_sale' ? '已上架' : '已下架');
  await loadData();
}

onMounted(loadData);
</script>

<template>
  <el-card v-loading="loading">
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>二级市场与价格配置</template>
      <el-form inline>
        <el-form-item label="开放交易">
          <el-switch v-model="marketForm.enabled" />
        </el-form-item>
        <el-form-item label="需实名">
          <el-switch v-model="marketForm.requireKyc" />
        </el-form-item>
        <el-form-item label="日波动幅度">
          <el-input-number v-model="marketForm.dailyFluctuationPct" :min="0" :max="1" :step="0.01" :precision="2" />
          <span style="margin-left: 6px; color: #909399">如 0.05 = ±5%</span>
        </el-form-item>
        <el-form-item label="成交溢价比例">
          <el-input-number v-model="marketForm.dealPremiumPct" :min="0" :max="1" :step="0.01" :precision="2" />
          <span style="margin-left: 6px; color: #909399">成交价 = 当前价 × (1 + random×比例)</span>
        </el-form-item>
        <el-form-item label="挂单价区间">
          <el-input-number v-model="marketForm.minPrice" :min="0" />
          <span style="margin: 0 4px">~</span>
          <el-input-number v-model="marketForm.maxPrice" :min="0" />
        </el-form-item>
        <el-form-item label="手续费">
          <span>{{ (marketForm.feeRate * 100).toFixed(1) }}%（贡献金规则配置）</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveMarket">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-button type="primary" style="margin-bottom: 16px" @click="openCreate">发行藏品</el-button>

    <el-table :data="list" border>
      <el-table-column label="封面" width="88">
        <template #default="{ row }">
          <el-image :src="row.cover" style="width: 56px; height: 56px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="藏品名称" min-width="140" />
      <el-table-column prop="startPrice" label="起始价" width="90" />
      <el-table-column prop="currentPrice" label="当前价" width="90" />
      <el-table-column label="库存" width="120">
        <template #default="{ row }">{{ row.stock }} / {{ row.totalSupply }}</template>
      </el-table-column>
      <el-table-column prop="limitPerUser" label="限购" width="80">
        <template #default="{ row }">{{ row.limitPerUser || '不限' }}</template>
      </el-table-column>
      <el-table-column prop="lastPriceDate" label="价更日期" width="110" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }: { row: AdminNft }">{{ statusText[row.status] }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="toggleStatus(row)">
            {{ row.status === 'on_sale' ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !list.length" description="暂无藏品，点击发行" />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑藏品' : '发行藏品'" width="520px">
      <el-form label-width="110px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="封面 URL" required>
          <el-input v-model="form.cover" />
        </el-form-item>
        <el-form-item label="发行方">
          <el-input v-model="form.publisher" />
        </el-form-item>
        <el-form-item v-if="!editingId" label="发行量" required>
          <el-input-number v-model="form.totalSupply" :min="1" />
        </el-form-item>
        <el-form-item v-else label="剩余库存">
          <el-input-number v-model="form.stock" :min="0" :max="form.totalSupply" />
        </el-form-item>
        <el-form-item label="起始价格" required>
          <el-input-number v-model="form.startPrice" :min="0" :precision="2" />
          <span style="margin-left: 8px; color: #909399">当前价将从此起步并每日波动</span>
        </el-form-item>
        <el-form-item label="每人限购">
          <el-input-number v-model="form.limitPerUser" :min="0" />
          <span style="margin-left: 8px; color: #909399">0 表示不限</span>
        </el-form-item>
        <el-form-item label="权益说明">
          <el-input v-model="form.rightsDesc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="上架" value="on_sale" />
            <el-option label="下架" value="off_shelf" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
