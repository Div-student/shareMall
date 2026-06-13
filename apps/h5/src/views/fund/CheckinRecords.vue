<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCheckinRecords } from '@/api/fund';
import { useFundStore } from '@/stores/fund';

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const planId = ref<number | null>(null);
const records = ref<
  { dayIndex: number; checkinDate: string; status: string; cashoutAmount: number }[]
>([]);

const signedCount = computed(() => records.value.filter((r) => r.status === 'signed').length);
const missedCount = computed(() => records.value.filter((r) => r.status === 'missed').length);
const totalCashout = computed(() =>
  records.value.reduce((sum, r) => sum + (r.status === 'signed' ? r.cashoutAmount : 0), 0),
);

function statusText(status: string) {
  return status === 'signed' ? '已打卡' : '漏卡';
}

function statusType(status: string) {
  return status === 'signed' ? 'success' : 'danger';
}

async function load() {
  loading.value = true;
  try {
    await fundStore.fetchAccount();
    const active = fundStore.account?.activePlan;
    if (!active) {
      planId.value = null;
      records.value = [];
      return;
    }
    planId.value = active.id;
    const res = await fetchCheckinRecords(active.id);
    records.value = res.list;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="打卡记录" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="!planId">
      <van-empty description="暂无进行中的打卡计划">
        <van-button type="primary" size="small" @click="router.push('/fund/checkin')">
          去开启打卡
        </van-button>
      </van-empty>
    </template>

    <template v-else>
      <div class="summary">
        <div class="item">
          <b>{{ signedCount }}</b>
          <span>已打卡</span>
        </div>
        <div class="item">
          <b>{{ missedCount }}</b>
          <span>漏卡</span>
        </div>
        <div class="item">
          <b>{{ totalCashout }}</b>
          <span>已兑现</span>
        </div>
      </div>

      <van-empty v-if="!records.length" description="暂无打卡记录" />

      <van-cell-group v-else inset style="margin-top: 12px">
        <van-cell
          v-for="item in records"
          :key="item.dayIndex"
          :title="`第 ${item.dayIndex} 天`"
          :label="item.checkinDate"
          :value="item.status === 'signed' ? `+${item.cashoutAmount}` : '作废'"
        >
          <template #right-icon>
            <van-tag :type="statusType(item.status)" style="margin-left: 8px">
              {{ statusText(item.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.summary {
  display: flex;
  background: #fff;
  margin: 12px 0;
}
.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 4px;
}
.item b {
  font-size: 20px;
  color: #1989fa;
}
.item span {
  font-size: 12px;
  color: #969799;
}
</style>
