<script setup lang="ts">
defineProps<{
  title: string;
  image: string;
  price: number;
  fundAmount?: number;
  originalPrice?: number | null;
  sales?: number;
}>();

const emit = defineEmits<{
  click: [];
}>();

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function formatSales(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.floor(k)}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}
</script>

<template>
  <article class="product-card" @click="emit('click')">
    <img v-if="image" :src="image" class="product-img" :alt="title" />
    <div v-else class="product-img ph-img square">IMG</div>
    <div class="product-info">
      <p class="product-name">{{ title }}</p>
      <div class="product-price">
        <span class="currency">¥</span>{{ formatPrice(price) }}
        <span v-if="originalPrice" class="original">¥{{ formatPrice(originalPrice) }}</span>
      </div>
      <div v-if="fundAmount != null" class="product-contribution">可获贡献金¥{{ formatPrice(fundAmount) }}</div>
      <div v-if="sales != null" class="product-sales">已售{{ formatSales(sales) }}</div>
    </div>
  </article>
</template>
