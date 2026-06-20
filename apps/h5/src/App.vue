<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import SmTabBar from '@/components/shop/SmTabBar.vue';
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

    <SmTabBar v-if="showTabbar" :cart-badge="cartBadge" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg);
}
</style>
