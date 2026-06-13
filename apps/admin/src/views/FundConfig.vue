<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { accruePendingFund, accrueWithdrawableCash, fetchFundRules, saveFundRules } from '@/api/fund';

const loading = ref(false);
const saving = ref(false);
const testPhone = ref('');
const testAmount = ref(100);
const withdrawTestPhone = ref('');
const withdrawTestAmount = ref(100);

const form = reactive({
  defaultRatio: 0.05,
  tiers: [90, 180, 360, 720] as number[],
  checkinDays: 30,
  missRule: 'void' as 'void' | 'makeup',
  deductLimitRate: 0.5,
  marketFeeRate: 0.05,
});

async function loadRules() {
  loading.value = true;
  try {
    const rules = await fetchFundRules();
    form.defaultRatio = rules.defaultRatio;
    form.tiers = [...rules.tiers];
    form.checkinDays = rules.checkinDays;
    form.missRule = rules.missRule;
    form.deductLimitRate = rules.deductLimitRate;
    form.marketFeeRate = rules.marketFeeRate;
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  saving.value = true;
  try {
    await saveFundRules({ ...form });
    ElMessage.success('配置已保存');
  } finally {
    saving.value = false;
  }
}

async function onAccrueTest() {
  if (!testPhone.value) {
    ElMessage.warning('请输入用户手机号');
    return;
  }
  await accruePendingFund(testPhone.value, testAmount.value, '后台测试充值');
  ElMessage.success('充值成功');
}

async function onAccrueWithdrawable() {
  if (!withdrawTestPhone.value) {
    ElMessage.warning('请输入用户手机号');
    return;
  }
  await accrueWithdrawableCash(withdrawTestPhone.value, withdrawTestAmount.value, '后台测试充值提现金');
  ElMessage.success('提现金充值成功');
}

onMounted(loadRules);
</script>

<template>
  <el-card v-loading="loading">
    <el-form :model="form" label-width="160px" style="max-width: 560px">
      <el-form-item label="默认贡献金比例">
        <el-input-number v-model="form.defaultRatio" :min="0" :max="1" :step="0.01" :precision="2" />
        <span class="hint">（0.05 = 5%）</span>
      </el-form-item>
      <el-form-item label="档位">
        <el-tag v-for="t in form.tiers" :key="t" style="margin-right: 8px">{{ t }}</el-tag>
      </el-form-item>
      <el-form-item label="打卡天数">
        <el-input-number v-model="form.checkinDays" :min="1" />
      </el-form-item>
      <el-form-item label="漏卡规则">
        <el-select v-model="form.missRule">
          <el-option label="当天收益作废" value="void" />
          <el-option label="允许补签" value="makeup" />
        </el-select>
      </el-form-item>
      <el-form-item label="抵扣上限">
        <el-input-number v-model="form.deductLimitRate" :min="0" :max="1" :step="0.01" :precision="2" />
        <span class="hint">（0.5 = 50%）</span>
      </el-form-item>
      <el-form-item label="二级市场手续费">
        <el-input-number v-model="form.marketFeeRate" :min="0" :max="1" :step="0.01" :precision="2" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="onSave">保存配置</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <el-form label-width="160px" style="max-width: 560px">
      <el-form-item label="测试充值（待兑现）">
        <el-input v-model="testPhone" placeholder="用户手机号" style="width: 180px; margin-right: 8px" />
        <el-input-number v-model="testAmount" :min="1" />
        <el-button style="margin-left: 8px" @click="onAccrueTest">充值</el-button>
      </el-form-item>
      <el-form-item label="测试充值（提现金）">
        <el-input
          v-model="withdrawTestPhone"
          placeholder="用户手机号"
          style="width: 180px; margin-right: 8px"
        />
        <el-input-number v-model="withdrawTestAmount" :min="1" />
        <el-button style="margin-left: 8px" @click="onAccrueWithdrawable">充值</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
