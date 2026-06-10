<script setup lang="ts"></script>

<template>
  <el-card>
    <el-button type="primary" style="margin-bottom: 16px">新增商品</el-button>
    <el-table :data="[]" border>
      <el-table-column prop="title" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="fundRatio" label="贡献金比例" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" />
    </el-table>
    <el-empty description="商品列表（接入接口后展示）" />
  </el-card>
</template>
