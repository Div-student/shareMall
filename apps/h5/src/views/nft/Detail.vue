<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { storeToRefs } from 'pinia';
import PriceChart from '@/components/PriceChart.vue';
import { exchangeNft, fetchNftDetail, type NftDetail } from '@/api/nft';
import { useFundStore } from '@/stores/fund';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const fundStore = useFundStore();
const userStore = useUserStore();
const { account } = storeToRefs(fundStore);
const { isLoggedIn } = storeToRefs(userStore);

const loading = ref(true);
const exchanging = ref(false);
const nft = ref<NftDetail | null>(null);

const dealRangeText = computed(() => {
  if (!nft.value) return '';
  return `${nft.value.dealPriceMin} ~ ${nft.value.dealPriceMax}`;
});

const canExchange = computed(() => {
  if (!nft.value || nft.value.stock <= 0) return false;
  if (!isLoggedIn.value) return false;
  return (account.value?.availableFund ?? 0) >= nft.value.dealPriceMax;
});

const limitText = computed(() => {
  if (!nft.value?.limitPerUser) return '不限';
  return `每人限兑 ${nft.value.limitPerUser} 份`;
});

async function load() {
  loading.value = true;
  try {
    nft.value = await fetchNftDetail(route.params.id as string);
  } catch {
    nft.value = null;
  } finally {
    loading.value = false;
  }
}

async function onExchange() {
  if (!nft.value) return;

  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  if (!canExchange.value) {
    showToast('可用贡献金不足或库存已售罄');
    return;
  }

  await showConfirmDialog({
    title: '确认兑换',
    message: `当前参考价 ${nft.value.currentPrice}，成交将在 ${dealRangeText.value} 贡献金范围内随机确定，是否继续？`,
  });

  exchanging.value = true;
  try {
    const res = await exchangeNft(nft.value.id);
    showToast(`兑换成功，成交价 ${res.dealPrice}，编号 ${res.serialNo}`);
    await Promise.all([load(), fundStore.fetchAccount()]);
    router.push('/nft/mine');
  } finally {
    exchanging.value = false;
  }
}

onMounted(async () => {
  if (isLoggedIn.value) {
    await fundStore.fetchAccount();
  }
  await load();
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="藏品详情" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="nft">
      <van-image width="100%" height="280" fit="cover" :src="nft.cover" />

      <div class="chart-block">
        <div class="chart-title">价格走势（近30日）</div>
        <PriceChart :data="nft.priceHistory" />
      </div>

      <van-cell-group inset>
        <van-cell title="名称" :value="nft.name" />
        <van-cell title="发行方" :value="nft.publisher || '—'" />
        <van-cell title="起始价格" :value="`${nft.startPrice} 贡献金`" />
        <van-cell title="当前参考价" :value="`${nft.currentPrice} 贡献金`" />
        <van-cell title="成交价格区间" :value="`${dealRangeText} 贡献金`" />
        <van-cell title="库存" :value="`${nft.stock} / ${nft.totalSupply}`" />
        <van-cell title="已兑" :value="String(nft.soldCount)" />
        <van-cell title="限购" :value="limitText" />
        <van-cell v-if="isLoggedIn" title="我的可用贡献金" :value="String(account?.availableFund ?? 0)" />
      </van-cell-group>

      <div v-if="nft.rightsDesc" class="rights">
        <div class="title">权益说明</div>
        <div class="content">{{ nft.rightsDesc }}</div>
      </div>

      <div class="footer">
        <van-button
          block
          type="primary"
          :loading="exchanging"
          :disabled="nft.stock <= 0"
          @click="onExchange"
        >
          {{ nft.stock <= 0 ? '已售罄' : `立即兑换（约 ${dealRangeText}）` }}
        </van-button>
      </div>
    </template>

    <van-empty v-else description="藏品不存在或已下架" />
  </div>
</template>

<style scoped>
.chart-block {
  margin: 12px 16px 0;
}
.chart-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 15px;
}
.rights {
  margin: 12px 16px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.content {
  color: #646566;
  font-size: 14px;
  line-height: 1.6;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
.page {
  padding-bottom: 72px;
}
</style>
