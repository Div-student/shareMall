<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    showBack?: boolean;
    fixed?: boolean;
  }>(),
  { showBack: true, fixed: false },
);

const emit = defineEmits<{
  back: [];
}>();
</script>

<template>
  <header class="app-header" :class="{ 'app-header--fixed': fixed }">
    <div class="app-header-start">
      <button
        v-if="showBack"
        type="button"
        class="back-btn"
        aria-label="返回"
        @click="emit('back')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>

    <span class="page-title">{{ title }}</span>

    <div class="header-actions">
      <slot name="actions" />
    </div>
  </header>
  <div v-if="fixed" class="app-header-spacer" aria-hidden="true" />
</template>
