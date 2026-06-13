<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();
const cartStore = useCartStore();
const { count: cartCount } = storeToRefs(cartStore);
const showTabbar = computed(() => route.meta.tabbar === true);
const cartBadge = computed(() => {
  const n = cartCount.value;
  if (n <= 0) return '';
  return n > 99 ? '99+' : n;
});

watch(
  () => [showTabbar.value, userStore.isLoggedIn] as const,
  ([visible, loggedIn]) => {
    if (visible && loggedIn) {
      void cartStore.fetchCount();
    } else if (!loggedIn) {
      cartStore.reset();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <van-tabbar v-if="showTabbar" route>
      <van-tabbar-item to="/home" icon="shop-o">首页</van-tabbar-item>
      <van-tabbar-item to="/fund" icon="gold-coin-o">贡献金</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="cart-o" :badge="cartBadge">购物车</van-tabbar-item>
      <van-tabbar-item to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
