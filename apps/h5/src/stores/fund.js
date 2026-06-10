import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/request';
export const useFundStore = defineStore('fund', () => {
    const account = ref(null);
    async function fetchAccount() {
        account.value = await request.get('/fund/account');
        return account.value;
    }
    return { account, fetchAccount };
});
//# sourceMappingURL=fund.js.map