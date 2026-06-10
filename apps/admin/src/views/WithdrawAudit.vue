<script setup lang="ts"></script>

<template>
  <el-card>
    <el-table :data="[]" border>
      <el-table-column prop="userId" label="用户" />
      <el-table-column prop="amount" label="提现金额" />
      <el-table-column prop="method" label="方式" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small" type="success">通过</el-button>
          <el-button size="small" type="danger">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty description="提现申请（接入接口后展示）" />
  </el-card>
</template>
