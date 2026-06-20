<script setup lang="ts">
defineProps<{
  amount: number | string;
  label?: string;
}>();
</script>

<template>
  <span class="contrib-badge">
    <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
      <path d="M8 1l2 4h4l-3.2 2.5 1.2 4.5L8 10l-4 2 1.2-4.5L2 5h4z" />
    </svg>
    {{ label ?? '可获贡献金' }} {{ amount }}
  </span>
</template>
