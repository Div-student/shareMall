import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface UserInfo {
  id: string;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  inviteCode: string;
  kycStatus: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'userInfo';

function loadUserInfo(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '');
  const userInfo = ref<UserInfo | null>(loadUserInfo());

  const isLoggedIn = computed(() => !!token.value);

  function setAuth(newToken: string, info: UserInfo) {
    token.value = newToken;
    userInfo.value = info;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(info));
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return { token, userInfo, isLoggedIn, setAuth, logout };
});
