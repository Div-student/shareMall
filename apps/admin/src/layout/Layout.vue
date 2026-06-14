<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const activeMenu = computed(() => route.path);

const menuItems = [
  { path: '/dashboard', title: '数据看板', permission: 'dashboard:view' },
  { path: '/products', title: '商品管理', permission: 'product:manage' },
  { path: '/orders', title: '订单管理', permission: 'order:manage' },
  { path: '/aftersale', title: '售后管理', permission: 'aftersale:manage' },
  { path: '/reviews', title: '评价管理', permission: 'review:manage' },
  { path: '/users', title: '用户管理', permission: 'user:view' },
  { path: '/kyc-audit', title: '实名审核', permission: 'kyc:audit' },
  { path: '/fund-config', title: '贡献金配置', permission: 'fund:config' },
  { path: '/nft', title: '数字藏品', permission: 'nft:manage' },
  { path: '/withdraw-audit', title: '提现审核', permission: 'withdraw:audit' },
  { path: '/finance/flow', title: '资金流水', permission: 'finance:view' },
  { path: '/finance/reports', title: '报表中心', permission: 'finance:view' },
  { path: '/finance/reconcile', title: '财务对账', permission: 'finance:view' },
  { path: '/coupons', title: '优惠券管理', permission: 'coupon:manage' },
  { path: '/campaigns', title: '活动管理', permission: 'campaign:manage' },
  { path: '/dicts', title: '字典管理', permission: 'dict:manage' },
  { path: '/service-config', title: '客服配置', permission: 'service:config' },
  { path: '/order-feed', title: '下单动态', permission: 'order-feed:config' },
  { path: '/notifications', title: '站内通知', permission: 'notification:manage' },
  { path: '/checkin-monitor', title: '打卡监控', permission: 'checkin:monitor' },
  { path: '/roles', title: '角色管理', permission: 'role:manage' },
  { path: '/accounts', title: '账号管理', permission: 'account:manage' },
  { path: '/logs', title: '操作日志', permission: 'log:view' },
];

const visibleMenus = computed(() =>
  menuItems.filter((item) => adminStore.hasPermission(item.permission)),
);

function logout() {
  adminStore.logout();
  router.replace('/login');
}

onMounted(() => {
  if (adminStore.isLoggedIn && !adminStore.adminInfo) {
    void adminStore.refreshProfile();
  }
});
</script>

<template>
  <el-container style="height: 100vh">
    <el-aside width="220px">
      <div class="logo">shareMall 后台</div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
          {{ item.title }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>{{ route.meta.title }}</span>
        <div class="header-right">
          <span class="admin-name">{{ adminStore.adminInfo?.username }}</span>
          <el-button link type="primary" @click="logout">退出</el-button>
        </div>
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
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 400;
}
.admin-name {
  color: #606266;
  font-size: 14px;
}
</style>
