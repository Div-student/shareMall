<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchOrderDetail } from '@/api/order';
import { fetchOrderReview, submitOrderReview } from '@/api/review';
import type { OrderDetail } from '@sharemall/shared';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const order = ref<OrderDetail | null>(null);
const alreadyReviewed = ref(false);

const form = ref({
  rating: 5,
  content: '',
  isAnonymous: false,
});

const orderId = route.params.id as string;

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace(`/orders/${orderId}`);
  }
}

async function load() {
  loading.value = true;
  try {
    const [detail, reviewRes] = await Promise.all([
      fetchOrderDetail(orderId),
      fetchOrderReview(orderId),
    ]);
    order.value = detail;
    alreadyReviewed.value = reviewRes.reviewed;
    if (detail.status !== 'completed') {
      showToast('仅已完成订单可评价');
      goBack();
    }
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (alreadyReviewed.value) {
    showToast('该订单已评价');
    return;
  }
  if (!form.value.content.trim()) {
    showToast('请填写评价内容');
    return;
  }
  submitting.value = true;
  try {
    await submitOrderReview(orderId, {
      rating: form.value.rating,
      content: form.value.content.trim(),
      isAnonymous: form.value.isAnonymous,
    });
    showToast('评价成功');
    router.replace(`/orders/${orderId}`);
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="订单评价" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else-if="order">
      <van-cell-group inset title="订单信息">
        <van-cell title="订单号" :value="order.orderNo" />
      </van-cell-group>

      <van-card
        v-for="item in order.items"
        :key="item.id"
        :num="item.quantity"
        :price="item.price.toFixed(2)"
        :title="item.title"
        :thumb="item.mainImage"
      />

      <van-empty v-if="alreadyReviewed" description="您已评价过该订单" />

      <van-form v-else @submit="onSubmit">
        <van-cell-group inset title="评价内容">
          <van-cell title="评分">
            <template #value>
              <van-rate v-model="form.rating" :count="5" />
            </template>
          </van-cell>
          <van-field
            v-model="form.content"
            rows="4"
            autosize
            type="textarea"
            maxlength="500"
            placeholder="说说商品和使用感受吧"
            show-word-limit
          />
          <van-cell title="匿名评价">
            <template #right-icon>
              <van-switch v-model="form.isAnonymous" size="20" />
            </template>
          </van-cell>
        </van-cell-group>

        <div class="footer">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            提交评价
          </van-button>
        </div>
      </van-form>
    </template>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 80px;
}
.footer {
  padding: 16px;
}
</style>
