<script setup lang="ts"></script>

<template>
  <el-card>
    <el-table :data="[]" border>
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="payAmount" label="实付" />
      <el-table-column prop="fundDeductAmount" label="贡献金抵扣" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" />
    </el-table>
    <el-empty description="订单列表（接入接口后展示）" />
  </el-card>
</template>
