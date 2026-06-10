<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<template>
  <el-container style="height: 100vh">
    <el-aside width="220px">
      <div class="logo">shareMall 后台</div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/dashboard">数据看板</el-menu-item>
        <el-menu-item index="/products">商品管理</el-menu-item>
        <el-menu-item index="/orders">订单管理</el-menu-item>
        <el-menu-item index="/users">用户管理</el-menu-item>
        <el-menu-item index="/fund-config">贡献金配置</el-menu-item>
        <el-menu-item index="/nft">数字藏品</el-menu-item>
        <el-menu-item index="/withdraw-audit">提现审核</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>{{ route.meta.title }}</span>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.logo {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-weight: 600;
  color: #409eff;
}
.header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
}
</style>
