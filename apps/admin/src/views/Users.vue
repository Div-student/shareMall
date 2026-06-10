<script setup lang="ts"></script>

<template>
  <el-card>
    <el-table :data="[]" border>
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="kycStatus" label="实名状态" />
      <el-table-column prop="availableFund" label="可用贡献金" />
      <el-table-column prop="withdrawableCash" label="提现金" />
      <el-table-column label="操作" />
    </el-table>
    <el-empty description="用户列表（接入接口后展示）" />
  </el-card>
</template>
