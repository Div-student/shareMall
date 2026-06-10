<script setup lang="ts"></script>

<template>
  <el-card>
    <el-button type="primary" style="margin-bottom: 16px">发行藏品</el-button>
    <el-table :data="[]" border>
      <el-table-column prop="name" label="藏品名称" />
      <el-table-column prop="exchangeFund" label="兑换所需贡献金" />
      <el-table-column prop="stock" label="库存" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" />
    </el-table>
    <el-empty description="藏品列表（接入接口后展示）" />
  </el-card>
</template>
