import { createRouter, createWebHistory } from 'vue-router';
// M1 P0 路由（详见 docs/页面路由表与开发排期.md）
const routes = [
    { path: '/', redirect: '/home' },
    // 账号认证
    { path: '/login', name: 'Login', component: () => import('@/views/auth/Login.vue') },
    { path: '/register', name: 'Register', component: () => import('@/views/auth/Register.vue') },
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
        meta: { tabbar: true },
    },
    {
        path: '/order/confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/order/OrderConfirm.vue'),
    },
    { path: '/order/pay/:orderId', name: 'Pay', component: () => import('@/views/order/Pay.vue') },
    {
        path: '/order/result/:orderId',
        name: 'PayResult',
        component: () => import('@/views/order/PayResult.vue'),
    },
    // 订单
    { path: '/orders', name: 'Orders', component: () => import('@/views/order/Orders.vue') },
    { path: '/orders/:id', name: 'OrderDetail', component: () => import('@/views/order/OrderDetail.vue') },
    // 贡献金
    {
        path: '/fund',
        name: 'Fund',
        component: () => import('@/views/fund/Fund.vue'),
        meta: { tabbar: true },
    },
    { path: '/fund/checkin', name: 'Checkin', component: () => import('@/views/fund/Checkin.vue') },
    {
        path: '/fund/records',
        name: 'FundRecords',
        component: () => import('@/views/fund/FundRecords.vue'),
    },
    // 个人中心
    {
        path: '/mine',
        name: 'Mine',
        component: () => import('@/views/mine/Mine.vue'),
        meta: { tabbar: true },
    },
    { path: '/mine/profile', name: 'Profile', component: () => import('@/views/mine/Profile.vue') },
    { path: '/mine/address', name: 'Address', component: () => import('@/views/mine/Address.vue') },
    { path: '/withdraw', name: 'Withdraw', component: () => import('@/views/mine/Withdraw.vue') },
];
export const router = createRouter({
    history: createWebHistory(),
    routes,
});
//# sourceMappingURL=index.js.map