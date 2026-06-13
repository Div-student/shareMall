<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFundStore } from '@/stores/fund';

const router = useRouter();
const fundStore = useFundStore();
const { account } = storeToRefs(fundStore);

const activePlan = computed(() => account.value?.activePlan);

function refreshAccount() {
  void fundStore.fetchAccount();
}

onMounted(refreshAccount);
onActivated(refreshAccount);

function goCheckin() {
  router.push('/fund/checkin');
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="贡献金中心" />

    <div class="wallet">
      <div class="cell">
        <span>待兑现贡献金</span>
        <b>{{ account?.pendingFund ?? 0 }}</b>
      </div>
      <div class="cell">
        <span>可用贡献金</span>
        <b>{{ account?.availableFund ?? 0 }}</b>
      </div>
      <div class="cell">
        <span>提现金</span>
        <b>{{ account?.withdrawableCash ?? 0 }}</b>
      </div>
    </div>

    <van-cell-group inset title="档位进度">
      <van-cell
        v-for="item in account?.tiers ?? []"
        :key="item.tier"
        :title="`${item.tier} 档`"
        :value="item.reached ? '已达标' : '未达标'"
        :label="activePlan?.tier === item.tier ? '打卡进行中' : undefined"
      />
    </van-cell-group>

    <van-grid :column-num="4">
      <van-grid-item icon="completed" text="打卡兑现" @click="goCheckin" />
      <van-grid-item icon="calendar-o" text="打卡记录" @click="router.push('/fund/checkin/records')" />
      <van-grid-item icon="balance-list-o" text="贡献金明细" @click="router.push('/fund/records')" />
      <van-grid-item icon="diamond-o" text="兑换藏品" @click="router.push('/nft/market')" />
    </van-grid>
  </div>
</template>

<style scoped>
.wallet {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  background: linear-gradient(135deg, #ffd01e, #ff8917);
  color: #fff;
}
.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.cell b {
  font-size: 20px;
}
</style>
