<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    messages: string[];
    interval?: number;
  }>(),
  { interval: 3500 },
);

const entries = ref<{ id: number; text: string; state: 'current' | 'entering' | 'leaving' }[]>([]);
let timer: ReturnType<typeof setInterval> | null = null;
let msgIdx = 0;
let entryId = 0;

function init() {
  if (!props.messages.length) {
    entries.value = [];
    return;
  }
  entries.value = [{ id: ++entryId, text: props.messages[0], state: 'current' }];
  msgIdx = 1 % props.messages.length;
}

function tick() {
  if (props.messages.length <= 1) return;

  const nextText = props.messages[msgIdx];
  msgIdx = (msgIdx + 1) % props.messages.length;

  entries.value.forEach((e) => {
    if (e.state === 'current') e.state = 'leaving';
  });

  const newEntry = { id: ++entryId, text: nextText, state: 'entering' as const };
  entries.value.push(newEntry);

  requestAnimationFrame(() => {
    const entering = entries.value.find((e) => e.id === newEntry.id);
    if (entering) entering.state = 'current';
  });

  setTimeout(() => {
    entries.value = entries.value.filter((e) => e.id === newEntry.id || e.state !== 'leaving');
  }, 400);
}

function start() {
  stop();
  init();
  if (props.messages.length > 1) {
    timer = setInterval(tick, props.interval);
  }
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

watch(() => props.messages, start, { deep: true });
onMounted(start);
onUnmounted(stop);
</script>

<template>
  <div v-if="messages.length" class="live-ticker">
    <div class="ticker-list">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="ticker-entry"
        :class="entry.state"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{{ entry.text }}</span>
      </div>
    </div>
  </div>
</template>
