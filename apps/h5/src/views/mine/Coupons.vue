<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { showToast } from 'vant';
import { claimCoupon, fetchClaimableCoupons, fetchMyCoupons, type UserCouponItem } from '@/api/operations';

const activeTab = ref(0);
const claimable = ref<Array<{ id: number; name: string; type: string; value: number; minAmount: number; claimed: boolean }>>([]);
const mine = ref<UserCouponItem[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const [claimRes, mineRes] = await Promise.all([fetchClaimableCoupons(), fetchMyCoupons()]);
    claimable.value = claimRes.list as typeof claimable.value;
    mine.value = mineRes.list;
  } finally {
    loading.value = false;
  }
}

async function onClaim(id: number) {
  await claimCoupon(id);
  showToast('领取成功');
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的优惠券" left-arrow @click-left="$router.back()" />
    <van-tabs v-model:active="activeTab" @change="load">
      <van-tab title="可领取">
        <van-loading v-if="loading" style="padding: 40px; text-align: center" />
        <van-empty v-else-if="!claimable.length" description="暂无可领优惠券" />
        <van-cell-group v-else inset>
          <van-cell
            v-for="item in claimable"
            :key="item.id"
            :title="item.name"
            :label="`满${item.minAmount}可用`"
            :value="item.type === 'fixed' ? `减${item.value}元` : `${item.value * 10}折`"
          >
            <template #right-icon>
              <van-button
                v-if="!item.claimed"
                size="small"
                type="primary"
                @click="onClaim(item.id)"
              >
                领取
              </van-button>
              <span v-else class="claimed">已领</span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab title="我的券">
        <van-empty v-if="!mine.length" description="暂无优惠券" />
        <van-cell-group v-else inset>
          <van-cell
            v-for="item in mine"
            :key="item.id"
            :title="item.coupon?.name ?? '优惠券'"
            :label="`状态：${item.status === 'unused' ? '未使用' : item.status === 'used' ? '已使用' : '已过期'}`"
          />
        </van-cell-group>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped>
.claimed {
  color: #969799;
  font-size: 12px;
}
</style>
