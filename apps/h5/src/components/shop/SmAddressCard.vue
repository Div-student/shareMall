<script setup lang="ts">
import type { UserAddress } from '@sharemall/shared';

defineProps<{
  address: UserAddress | null;
  placeholder?: string;
}>();
</script>

<template>
  <div class="address-card">
    <template v-if="address">
      <div>
        <span class="address-name">{{ address.receiver }}</span>
        <span class="address-phone">{{ address.phone }}</span>
        <span v-if="address.isDefault" class="address-tag">默认</span>
      </div>
      <div class="address-detail">{{ address.fullAddress }}</div>
    </template>
    <template v-else>
      <div class="address-detail">{{ placeholder ?? '请选择收货地址' }}</div>
    </template>
  </div>
</template>
