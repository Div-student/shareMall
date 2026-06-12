<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { FundRecord } from '@sharemall/shared';
import { fetchFundRecords } from '@/api/fund';

const loading = ref(true);
const list = ref<FundRecord[]>([]);

const changeTypeMap: Record<string, string> = {
  order_accrue: '下单累计',
  checkin_cashout: '打卡兑现',
  order_deduct: '下单抵扣',
  nft_exchange: '藏品兑换',
  nft_trade_income: '藏品成交',
  aftersale_void: '售后作废',
  aftersale_rollback: '售后回退',
  withdraw: '提现',
  task_reward: '任务奖励',
};

onMounted(async () => {
  try {
    const res = await fetchFundRecords({ page: 1, pageSize: 50 });
    list.value = res.list;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="贡献金明细" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" style="padding: 24px; text-align: center" />
    <van-empty v-else-if="!list.length" description="暂无明细" />
    <van-cell-group v-else inset>
      <van-cell
        v-for="item in list"
        :key="item.id"
        :title="changeTypeMap[item.changeType] ?? item.changeType"
        :label="item.remark"
        :value="`${item.amount > 0 ? '+' : ''}${item.amount}`"
      />
    </van-cell-group>
  </div>
</template>
