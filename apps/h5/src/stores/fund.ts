import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FundAccount } from '@sharemall/shared';
import request from '@/api/request';

export const useFundStore = defineStore('fund', () => {
  const account = ref<FundAccount | null>(null);

  async function fetchAccount() {
    account.value = await request.get<unknown, FundAccount>('/fund/account');
    return account.value;
  }

  return { account, fetchAccount };
});
