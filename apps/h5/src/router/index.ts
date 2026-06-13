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
  {
    path: '/kyc',
    name: 'Kyc',
    component: () => import('@/views/auth/Kyc.vue'),
    meta: { requiresAuth: true },
  },

  // 商品与购物
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { tabbar: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/Search.vue'),
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
    path: '/fund/checkin/records',
    name: 'CheckinRecords',
    component: () => import('@/views/fund/CheckinRecords.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/fund/records',
    name: 'FundRecords',
    component: () => import('@/views/fund/FundRecords.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/tasks/Tasks.vue'),
    meta: { requiresAuth: true },
  },

  // 数字藏品
  {
    path: '/nft/market',
    name: 'NftMarket',
    component: () => import('@/views/nft/Market.vue'),
  },
  {
    path: '/nft/mine',
    name: 'NftMine',
    component: () => import('@/views/nft/Mine.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/nft/trade',
    name: 'NftTrade',
    component: () => import('@/views/nft/Trade.vue'),
  },
  {
    path: '/nft/listings',
    name: 'NftListings',
    component: () => import('@/views/nft/Listings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/nft/mine/:userNftId/sell',
    name: 'NftSell',
    component: () => import('@/views/nft/Sell.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/nft/mine/:userNftId',
    name: 'NftMineDetail',
    component: () => import('@/views/nft/MineDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/nft/:id',
    name: 'NftDetail',
    component: () => import('@/views/nft/Detail.vue'),
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
    path: '/mine/invite',
    name: 'Invite',
    component: () => import('@/views/mine/Invite.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/mine/Withdraw.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/withdraw/records',
    name: 'WithdrawRecords',
    component: () => import('@/views/mine/WithdrawRecords.vue'),
    meta: { requiresAuth: true },
  },

  // 售后
  {
    path: '/aftersale',
    name: 'Aftersale',
    component: () => import('@/views/order/Aftersale.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/aftersale/apply',
    name: 'AftersaleApply',
    component: () => import('@/views/order/AftersaleApply.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/aftersale/:id',
    name: 'AftersaleDetail',
    component: () => import('@/views/order/AftersaleDetail.vue'),
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
