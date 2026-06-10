import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'AdminLogin', component: () => import('@/views/Login.vue') },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '数据看板' } },
      { path: 'products', name: 'Products', component: () => import('@/views/Products.vue'), meta: { title: '商品管理' } },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/Orders.vue'), meta: { title: '订单管理' } },
      { path: 'users', name: 'Users', component: () => import('@/views/Users.vue'), meta: { title: '用户管理' } },
      { path: 'fund-config', name: 'FundConfig', component: () => import('@/views/FundConfig.vue'), meta: { title: '贡献金配置' } },
      { path: 'nft', name: 'AdminNft', component: () => import('@/views/Nft.vue'), meta: { title: '数字藏品' } },
      { path: 'withdraw-audit', name: 'WithdrawAudit', component: () => import('@/views/WithdrawAudit.vue'), meta: { title: '提现审核' } },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
