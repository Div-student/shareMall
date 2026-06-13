<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchUserNftDetail, type UserNftDetail } from '@/api/nft';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const detail = ref<UserNftDetail | null>(null);

const statusMap: Record<UserNftDetail['status'], string> = {
  holding: '持有中',
  listed: '挂单中',
  sold: '已售出',
  transferred: '已转赠',
};

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchUserNftDetail(route.params.userNftId as string);
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

function goSell() {
  if (!detail.value) return;
  router.push(`/nft/mine/${detail.value.id}/sell`);
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="藏品详情" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="detail">
      <van-image width="100%" height="240" fit="cover" :src="detail.cover" />
      <van-cell-group inset>
        <van-cell title="名称" :value="detail.name" />
        <van-cell title="编号" :value="detail.serialNo" />
        <van-cell title="状态" :value="statusMap[detail.status]" />
        <van-cell
          v-if="detail.activeListing"
          title="当前挂价"
          :value="`${detail.activeListing.price} 贡献金`"
        />
      </van-cell-group>

      <div class="actions">
        <van-button
          v-if="detail.status === 'holding'"
          block
          type="primary"
          @click="goSell"
        >
          挂单卖出
        </van-button>
        <van-button
          v-else-if="detail.status === 'listed'"
          block
          type="primary"
          plain
          @click="router.push('/nft/listings')"
        >
          查看我的挂单
        </van-button>
      </div>
    </template>

    <van-empty v-else description="藏品不存在" />
  </div>
</template>

<style scoped>
.actions {
  padding: 16px;
}
</style>
