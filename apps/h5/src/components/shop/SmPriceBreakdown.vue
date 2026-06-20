<script setup lang="ts">
defineProps<{
  totalAmount: number;
  fundDeductAmount?: number;
  couponAmount?: number;
  freight?: number;
  payAmount: number;
}>();
</script>

<template>
  <div class="price-breakdown">
    <div class="row muted">
      <span>商品总额</span>
      <span>¥{{ totalAmount.toFixed(2) }}</span>
    </div>
    <div v-if="(fundDeductAmount ?? 0) > 0" class="row muted">
      <span>贡献金抵扣</span>
      <span>-¥{{ fundDeductAmount!.toFixed(2) }}</span>
    </div>
    <div v-if="(couponAmount ?? 0) > 0" class="row muted">
      <span>优惠券</span>
      <span>-¥{{ couponAmount!.toFixed(2) }}</span>
    </div>
    <div class="row muted">
      <span>运费</span>
      <span>¥{{ (freight ?? 0).toFixed(2) }}</span>
    </div>
    <div class="row total">
      <span>实付金额</span>
      <span class="amount">¥{{ payAmount.toFixed(2) }}</span>
    </div>
  </div>
</template>
