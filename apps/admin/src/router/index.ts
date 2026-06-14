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
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '分类管理', permission: 'product:manage' },
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
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('@/views/Reviews.vue'),
        meta: { title: '评价管理', permission: 'review:manage' },
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
        path: 'finance/flow',
        name: 'FinanceFlow',
        component: () => import('@/views/FinanceFlow.vue'),
        meta: { title: '资金流水', permission: 'finance:view' },
      },
      {
        path: 'finance/reports',
        name: 'FinanceReports',
        component: () => import('@/views/FinanceReports.vue'),
        meta: { title: '报表中心', permission: 'finance:view' },
      },
      {
        path: 'finance/reconcile',
        name: 'FinanceReconcile',
        component: () => import('@/views/FinanceReconcile.vue'),
        meta: { title: '财务对账', permission: 'finance:view' },
      },
      {
        path: 'coupons',
        name: 'Coupons',
        component: () => import('@/views/Coupons.vue'),
        meta: { title: '优惠券管理', permission: 'coupon:manage' },
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: () => import('@/views/Campaigns.vue'),
        meta: { title: '活动管理', permission: 'campaign:manage' },
      },
      {
        path: 'dicts',
        name: 'Dicts',
        component: () => import('@/views/Dicts.vue'),
        meta: { title: '字典管理', permission: 'dict:manage' },
      },
      {
        path: 'service-config',
        name: 'ServiceConfig',
        component: () => import('@/views/ServiceConfig.vue'),
        meta: { title: '客服配置', permission: 'service:config' },
      },
      {
        path: 'order-feed',
        name: 'OrderFeed',
        component: () => import('@/views/OrderFeed.vue'),
        meta: { title: '下单动态配置', permission: 'order-feed:config' },
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/Notifications.vue'),
        meta: { title: '站内通知', permission: 'notification:manage' },
      },
      {
        path: 'checkin-monitor',
        name: 'CheckinMonitor',
        component: () => import('@/views/CheckinMonitor.vue'),
        meta: { title: '打卡监控', permission: 'checkin:monitor' },
      },
      {
        path: 'sms',
        name: 'SmsConfig',
        component: () => import('@/views/Sms.vue'),
        meta: { title: '短信配置', permission: 'sms:config' },
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
