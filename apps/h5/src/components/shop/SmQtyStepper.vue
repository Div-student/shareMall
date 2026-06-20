<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
  change: [value: number];
}>();

function dec() {
  const next = props.modelValue - 1;
  if (next < (props.min ?? 1)) return;
  emit('update:modelValue', next);
  emit('change', next);
}

function inc() {
  const next = props.modelValue + 1;
  if (props.max != null && next > props.max) return;
  emit('update:modelValue', next);
  emit('change', next);
}
</script>

<template>
  <div class="qty-stepper">
    <button type="button" :disabled="modelValue <= (min ?? 1)" @click="dec">−</button>
    <span class="qty-value">{{ modelValue }}</span>
    <button type="button" :disabled="max != null && modelValue >= max" @click="inc">+</button>
  </div>
</template>
