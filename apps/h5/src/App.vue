<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showTabbar = computed(() => route.meta.tabbar === true);
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
      <van-tabbar-item to="/cart" icon="cart-o">购物车</van-tabbar-item>
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
