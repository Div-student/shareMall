<script setup lang="ts">
const cards = [
  { label: 'GMV', value: '0' },
  { label: '订单数', value: '0' },
  { label: '待兑现贡献金', value: '0' },
  { label: '待审核提现', value: '0' },
];
</script>

<template>
  <el-row :gutter="16">
    <el-col v-for="c in cards" :key="c.label" :span="6">
      <el-card>
        <div class="label">{{ c.label }}</div>
        <div class="value">{{ c.value }}</div>
      </el-card>
    </el-col>
  </el-row>
  <el-empty description="经营指标趋势图（接入接口后展示）" />
</template>

<style scoped>
.label {
  color: #909399;
  font-size: 13px;
}
.value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 8px;
}
</style>
