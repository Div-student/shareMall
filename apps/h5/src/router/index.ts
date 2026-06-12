import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

// M1 P0 路由（详见 docs/页面路由表与开发排期.md）
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },

  // 账号认证
  { path: '/login', name: 'Login', component: () => import('@/views/auth/Login.vue'), meta: { guest: true } },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { guest: true },
  },

  // 商品与购物
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { tabbar: true },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/product/ProductDetail.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/cart/Cart.vue'),
    meta: { tabbar: true, requiresAuth: true },
  },
  {
    path: '/order/confirm',
    name: 'OrderConfirm',
    component: () => import('@/views/order/OrderConfirm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/order/pay/:orderId',
    name: 'Pay',
    component: () => import('@/views/order/Pay.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/order/result/:orderId',
    name: 'PayResult',
    component: () => import('@/views/order/PayResult.vue'),
    meta: { requiresAuth: true },
  },

  // 订单
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/order/Orders.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/order/OrderDetail.vue'),
    meta: { requiresAuth: true },
  },

  // 贡献金
  {
    path: '/fund',
    name: 'Fund',
    component: () => import('@/views/fund/Fund.vue'),
    meta: { tabbar: true, requiresAuth: true },
  },
  {
    path: '/fund/checkin',
    name: 'Checkin',
    component: () => import('@/views/fund/Checkin.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/fund/records',
    name: 'FundRecords',
    component: () => import('@/views/fund/FundRecords.vue'),
    meta: { requiresAuth: true },
  },

  // 个人中心
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/Mine.vue'),
    meta: { tabbar: true },
  },
  {
    path: '/mine/profile',
    name: 'Profile',
    component: () => import('@/views/mine/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mine/address',
    name: 'Address',
    component: () => import('@/views/mine/Address.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/mine/Withdraw.vue'),
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guest && userStore.isLoggedIn) {
    return { path: '/home' };
  }

  return true;
});
