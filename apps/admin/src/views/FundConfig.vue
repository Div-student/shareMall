<script setup lang="ts">
import { reactive } from 'vue';
import { FUND_TIERS, DEFAULT_CHECKIN_DAYS } from '@sharemall/shared';

const form = reactive({
  defaultRatio: 5,
  tiers: [...FUND_TIERS],
  checkinDays: DEFAULT_CHECKIN_DAYS,
  missRule: 'void',
  deductLimitRate: 50,
  marketFeeRate: 5,
});
</script>

<template>
  <el-card>
    <el-form :model="form" label-width="160px" style="max-width: 560px">
      <el-form-item label="默认贡献金比例(%)">
        <el-input-number v-model="form.defaultRatio" :min="0" :max="100" />
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
      <el-form-item label="抵扣上限(%)">
        <el-input-number v-model="form.deductLimitRate" :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="二级市场手续费(%)">
        <el-input-number v-model="form.marketFeeRate" :min="0" :max="100" />
      </el-form-item>
      <el-button type="primary">保存配置</el-button>
    </el-form>
  </el-card>
</template>
