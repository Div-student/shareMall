<script setup lang="ts">
defineProps<{
  aboveTabbar?: boolean;
}>();
</script>

<template>
  <div class="action-bar" :class="aboveTabbar ? 'above-tabbar' : 'at-bottom'">
    <slot />
  </div>
</template>
