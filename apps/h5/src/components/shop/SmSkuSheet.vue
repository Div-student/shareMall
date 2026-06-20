<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ProductDetail, ProductSku } from '@sharemall/shared';
import SmQtyStepper from './SmQtyStepper.vue';

const props = defineProps<{
  show: boolean;
  product: ProductDetail;
  selectedSkuId: number | null;
  mode?: 'cart' | 'buy';
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'update:selectedSkuId': [id: number];
  confirm: [payload: { skuId: number; quantity: number }];
}>();

const quantity = ref(1);
const selectedSpecs = ref<Record<string, string>>({});
const deductOn = ref(false);

const COLOR_MAP: Record<string, string> = {
  曜石黑: '#1a1a1a',
  云雾白: '#f0ede6',
  暮光蓝: '#3b5998',
};

const specDimensions = computed(() => {
  const dims = new Set<string>();
  props.product.skus.forEach((sku) => {
    Object.keys(sku.spec).forEach((k) => dims.add(k));
  });
  return Array.from(dims);
});

const specOptions = computed(() => {
  const map: Record<string, string[]> = {};
  for (const dim of specDimensions.value) {
    const values = new Set<string>();
    props.product.skus.forEach((sku) => {
      if (sku.spec[dim]) values.add(sku.spec[dim]);
    });
    map[dim] = Array.from(values);
  }
  return map;
});

const currentSku = computed(() => {
  return props.product.skus.find((s) => s.id === props.selectedSkuId) ?? props.product.skus[0] ?? null;
});

const displayImage = computed(() => currentSku.value?.skuImage ?? props.product.mainImage);
const displayPrice = computed(() => (currentSku.value?.price ?? props.product.price) * quantity.value);
const maxStock = computed(() => currentSku.value?.stock ?? 99);
const stockLabel = computed(() => {
  const stock = maxStock.value;
  if (stock <= 0) return '库存不足';
  if (stock > 50) return '库存充足';
  return `库存 ${stock}`;
});

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function findSkuBySpecs(specs: Record<string, string>): ProductSku | undefined {
  return props.product.skus.find((sku) =>
    specDimensions.value.every((dim) => !specs[dim] || sku.spec[dim] === specs[dim]),
  );
}

function isOptionAvailable(dim: string, value: string) {
  const trial = { ...selectedSpecs.value, [dim]: value };
  return props.product.skus.some(
    (sku) =>
      specDimensions.value.every((d) => !trial[d] || sku.spec[d] === trial[d]) && sku.stock > 0,
  );
}

function isColorDim(dim: string) {
  return /颜色/.test(dim);
}

function colorForValue(value: string) {
  return COLOR_MAP[value];
}

function selectSpec(dim: string, value: string) {
  if (!isOptionAvailable(dim, value)) return;
  selectedSpecs.value = { ...selectedSpecs.value, [dim]: value };
  const sku = findSkuBySpecs(selectedSpecs.value);
  if (sku) emit('update:selectedSkuId', sku.id);
}

function close() {
  emit('update:show', false);
}

function onConfirm() {
  if (!currentSku.value) return;
  emit('confirm', { skuId: currentSku.value.id, quantity: quantity.value });
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) return;
    quantity.value = 1;
    deductOn.value = false;
    const sku = props.product.skus.find((s) => s.id === props.selectedSkuId) ?? props.product.skus[0];
    if (sku) {
      selectedSpecs.value = { ...sku.spec };
      emit('update:selectedSkuId', sku.id);
    }
  },
);

watch(
  () => props.selectedSkuId,
  (id) => {
    const sku = props.product.skus.find((s) => s.id === id);
    if (sku) selectedSpecs.value = { ...sku.spec };
  },
);
</script>

<template>
  <Teleport to="body">
    <div class="sku-modal-overlay" :class="{ open: show }" @click="close" />
    <div class="sku-modal" :class="{ open: show }">
      <div class="modal-header">
        <div class="modal-product-thumb">
          <img v-if="displayImage" :src="displayImage" alt="" />
          <div v-else class="ph-img square">产品图</div>
        </div>
        <div class="modal-price-info">
          <div class="modal-price">¥{{ formatPrice(displayPrice) }}</div>
          <div class="modal-stock">{{ stockLabel }}</div>
        </div>
        <button type="button" class="modal-close" aria-label="关闭" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="sku-body">
        <div v-for="dim in specDimensions" :key="dim" class="sku-group">
          <div class="sku-group-label">{{ dim }}</div>
          <div class="sku-options">
            <button
              v-for="opt in specOptions[dim]"
              :key="opt"
              type="button"
              class="sku-option"
              :class="{ selected: selectedSpecs[dim] === opt, disabled: !isOptionAvailable(dim, opt) }"
              :disabled="!isOptionAvailable(dim, opt)"
              @click="selectSpec(dim, opt)"
            >
              <span
                v-if="isColorDim(dim) && colorForValue(opt)"
                class="color-chip"
                :style="{ background: colorForValue(opt) }"
              />
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="qty-row">
          <span class="qty-label">数量</span>
          <SmQtyStepper v-model="quantity" :min="1" :max="Math.min(99, maxStock)" />
        </div>

        <div v-if="product.allowFundDeduct" class="contrib-deduct-row">
          <span class="deduct-label">
            支持贡献金抵扣
            <span style="font-size: var(--text-xs); color: var(--meta)">(1贡献金=1元)</span>
          </span>
          <button
            type="button"
            class="deduct-switch"
            :class="{ on: deductOn }"
            aria-label="贡献金抵扣"
            @click="deductOn = !deductOn"
          />
        </div>
      </div>

      <div class="sku-footer">
        <button type="button" class="btn-confirm" @click="onConfirm">确定</button>
      </div>
    </div>
  </Teleport>
</template>
