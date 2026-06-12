import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FundAccount } from '@sharemall/shared';
import { fetchFundAccount } from '@/api/fund';

export const useFundStore = defineStore('fund', () => {
  const account = ref<FundAccount | null>(null);

  async function fetchAccount() {
    account.value = await fetchFundAccount();
    return account.value;
  }

  function reset() {
    account.value = null;
  }

  return { account, fetchAccount, reset };
});
