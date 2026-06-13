import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminInfo } from '@/api/admin';
import { fetchAdminProfile } from '@/api/admin';

const TOKEN_KEY = 'admin_token';

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? '');
  const adminInfo = ref<AdminInfo | null>(null);

  const isLoggedIn = computed(() => Boolean(token.value));
  const permissions = computed(() => adminInfo.value?.permissions ?? []);

  function setAuth(nextToken: string, info: AdminInfo) {
    token.value = nextToken;
    adminInfo.value = info;
    localStorage.setItem(TOKEN_KEY, nextToken);
  }

  function logout() {
    token.value = '';
    adminInfo.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  function hasPermission(key: string) {
    const list = permissions.value;
    if (list.includes('*')) return true;
    return list.includes(key);
  }

  async function refreshProfile() {
    if (!token.value) return null;
    adminInfo.value = await fetchAdminProfile();
    return adminInfo.value;
  }

  return {
    token,
    adminInfo,
    isLoggedIn,
    permissions,
    setAuth,
    logout,
    hasPermission,
    refreshProfile,
  };
});
