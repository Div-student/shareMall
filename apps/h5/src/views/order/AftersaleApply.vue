<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { applyAftersale } from '@/api/aftersale';
import { fetchOrderDetail } from '@/api/order';
import type { OrderDetail } from '@sharemall/shared';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const order = ref<OrderDetail | null>(null);
const form = ref({
  type: 'refund_only' as 'refund_only' | 'return_refund',
  reason: '',
});

const orderId = computed(() => Number(route.query.orderId));

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/orders');
  }
}

async function load() {
  if (!orderId.value) {
    showToast('缺少订单信息');
    goBack();
    return;
  }
  loading.value = true;
  try {
    order.value = await fetchOrderDetail(orderId.value);
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!form.value.reason.trim()) {
    showToast('请填写售后原因');
    return;
  }
  submitting.value = true;
  try {
    await applyAftersale({
      orderId: orderId.value,
      type: form.value.type,
      reason: form.value.reason.trim(),
    });
    showToast('售后申请已提交');
    router.replace('/aftersale');
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="申请售后" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />

    <template v-else-if="order">
      <van-cell-group inset title="订单信息">
        <van-cell title="订单号" :value="order.orderNo" />
        <van-cell title="实付金额" :value="`¥${order.payAmount.toFixed(2)}`" />
        <van-cell title="贡献金抵扣" :value="`¥${order.fundDeductAmount.toFixed(2)}`" />
      </van-cell-group>

      <van-form @submit="onSubmit">
        <van-cell-group inset title="售后类型">
          <van-radio-group v-model="form.type">
            <van-cell title="仅退款" clickable @click="form.type = 'refund_only'">
              <template #right-icon><van-radio name="refund_only" /></template>
            </van-cell>
            <van-cell title="退货退款" clickable @click="form.type = 'return_refund'">
              <template #right-icon><van-radio name="return_refund" /></template>
            </van-cell>
          </van-radio-group>
        </van-cell-group>

        <van-cell-group inset title="申请说明">
          <van-field
            v-model="form.reason"
            rows="3"
            autosize
            type="textarea"
            maxlength="255"
            placeholder="请描述售后原因"
            show-word-limit
          />
        </van-cell-group>

        <div class="submit">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            提交申请
          </van-button>
        </div>
      </van-form>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.submit {
  padding: 24px 16px;
}
</style>
