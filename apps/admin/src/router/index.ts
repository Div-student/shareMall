import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'AdminLogin', component: () => import('@/views/Login.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', permission: 'dashboard:view' },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '商品管理', permission: 'product:manage' },
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理', permission: 'order:manage' },
      },
      {
        path: 'aftersale',
        name: 'AdminAftersale',
        component: () => import('@/views/Aftersale.vue'),
        meta: { title: '售后管理', permission: 'aftersale:manage' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', permission: 'user:view' },
      },
      {
        path: 'kyc-audit',
        name: 'KycAudit',
        component: () => import('@/views/KycAudit.vue'),
        meta: { title: '实名审核', permission: 'kyc:audit' },
      },
      {
        path: 'fund-config',
        name: 'FundConfig',
        component: () => import('@/views/FundConfig.vue'),
        meta: { title: '贡献金配置', permission: 'fund:config' },
      },
      {
        path: 'nft',
        name: 'AdminNft',
        component: () => import('@/views/Nft.vue'),
        meta: { title: '数字藏品', permission: 'nft:manage' },
      },
      {
        path: 'withdraw-audit',
        name: 'WithdrawAudit',
        component: () => import('@/views/WithdrawAudit.vue'),
        meta: { title: '提现审核', permission: 'withdraw:audit' },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/Roles.vue'),
        meta: { title: '角色管理', permission: 'role:manage' },
      },
      {
        path: 'accounts',
        name: 'AdminAccounts',
        component: () => import('@/views/AdminAccounts.vue'),
        meta: { title: '账号管理', permission: 'account:manage' },
      },
      {
        path: 'logs',
        name: 'OperationLogs',
        component: () => import('@/views/OperationLogs.vue'),
        meta: { title: '操作日志', permission: 'log:view' },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const adminStore = useAdminStore();

  if (to.meta.guest) {
    if (adminStore.isLoggedIn) return { path: '/dashboard' };
    return true;
  }

  if (!adminStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (!adminStore.adminInfo) {
    try {
      await adminStore.refreshProfile();
    } catch {
      adminStore.logout();
      return { path: '/login' };
    }
  }

  const permission = to.meta.permission as string | undefined;
  if (permission && !adminStore.hasPermission(permission)) {
    const fallback = routes
      .find((route) => route.children)
      ?.children?.find(
        (child) =>
          child.meta?.permission &&
          adminStore.hasPermission(child.meta.permission as string),
      );
    return fallback ? { path: `/${fallback.path}` } : { path: '/login' };
  }

  return true;
});
