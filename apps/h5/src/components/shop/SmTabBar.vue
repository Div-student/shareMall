<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  cartBadge?: string | number;
}>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const tabs = [
  { path: '/home', label: '首页', icon: 'home' },
  { path: '/category', label: '分类', icon: 'category' },
  { path: '/cart', label: '购物车', icon: 'cart' },
  { path: '/mine', label: '我的', icon: 'mine' },
] as const;

const badgeText = computed(() => {
  const n = props.cartBadge;
  if (!n || n === '' || n === 0) return '';
  if (typeof n === 'number') return n > 99 ? '99+' : String(n);
  return n;
});

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}

function onTabClick(path: string) {
  if (path === '/cart' && !userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/cart' } });
    return;
  }
  router.push(path);
}
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      type="button"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="onTabClick(tab.path)"
    >
      <svg v-if="tab.icon === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <svg v-else-if="tab.icon === 'category'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
      <svg v-else-if="tab.icon === 'cart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span v-if="tab.icon === 'cart' && badgeText" class="cart-badge">{{ badgeText }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
