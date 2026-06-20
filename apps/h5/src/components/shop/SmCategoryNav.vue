<script setup lang="ts">
import { HOME_CATEGORIES } from './homeCategories';

withDefaults(
  defineProps<{
    categories?: Array<{ id: number; name: string; icon?: string | null }>;
    variant?: 'api' | 'home';
  }>(),
  { variant: 'api' },
);

const emit = defineEmits<{
  select: [id: number];
}>();

function isIconUrl(icon?: string | null) {
  if (!icon) return false;
  return /^(https?:\/\/|\/)/.test(icon);
}

function iconBg(color: string) {
  return `color-mix(in oklch, ${color} 12%, transparent)`;
}

function onHomeSelect(id: number) {
  emit('select', id);
}
</script>

<template>
  <nav v-if="variant === 'home'" class="category-nav">
    <button
      v-for="cat in HOME_CATEGORIES"
      :key="cat.id"
      type="button"
      class="cat-item"
      @click="onHomeSelect(cat.id)"
    >
      <div class="cat-icon" :style="{ background: iconBg(cat.color) }">
        <svg
          v-if="cat.icon === 'star'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
        </svg>
        <svg
          v-else-if="cat.icon === 'digital'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6M9 13h4M4 9h16" />
        </svg>
        <svg
          v-else-if="cat.icon === 'home'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <svg
          v-else-if="cat.icon === 'beauty'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
        <svg
          v-else-if="cat.icon === 'food'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
        <svg
          v-else-if="cat.icon === 'fashion'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <svg
          v-else-if="cat.icon === 'baby'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <svg
          v-else-if="cat.icon === 'sport'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <svg
          v-else-if="cat.icon === 'jewelry'"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="cat.color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="5" cy="5" r="1" />
          <circle cx="19" cy="5" r="1" />
          <circle cx="5" cy="19" r="1" />
          <circle cx="19" cy="19" r="1" />
          <line x1="5" y1="5" x2="12" y2="12" />
          <line x1="19" y1="5" x2="12" y2="12" />
          <line x1="5" y1="19" x2="12" y2="12" />
          <line x1="19" y1="19" x2="12" y2="12" />
        </svg>
      </div>
      <span class="cat-label">{{ cat.name }}</span>
    </button>
  </nav>

  <nav v-else-if="categories?.length" class="category-nav">
    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      class="cat-item"
      @click="emit('select', cat.id)"
    >
      <div class="cat-icon" :class="{ 'has-image': isIconUrl(cat.icon) }">
        <img v-if="isIconUrl(cat.icon)" :src="cat.icon!" :alt="cat.name" class="cat-icon-img" />
        <span v-else>{{ cat.icon || cat.name.charAt(0) }}</span>
      </div>
      <span class="cat-label">{{ cat.name }}</span>
    </button>
  </nav>
</template>
