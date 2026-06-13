<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data: Array<{ date: string; price: number }>;
    width?: number;
    height?: number;
  }>(),
  {
    width: 320,
    height: 160,
  },
);

const padding = { top: 12, right: 8, bottom: 24, left: 8 };

const chart = computed(() => {
  const points = props.data;
  if (points.length < 2) return null;

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const innerW = props.width - padding.left - padding.right;
  const innerH = props.height - padding.top - padding.bottom;

  const coords = points.map((p, i) => {
    const x = padding.left + (i / (points.length - 1)) * innerW;
    const y = padding.top + innerH - ((p.price - min) / range) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${padding.top + innerH} L ${coords[0].x.toFixed(1)} ${padding.top + innerH} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const change = first.price ? ((last.price - first.price) / first.price) * 100 : 0;

  return { coords, linePath, areaPath, min, max, last, change };
});
</script>

<template>
  <div class="price-chart">
    <div v-if="!chart" class="empty">暂无足够价格数据</div>
    <template v-else>
      <div class="summary">
        <span class="current">{{ chart.last.price.toFixed(2) }}</span>
        <span :class="['change', chart.change >= 0 ? 'up' : 'down']">
          {{ chart.change >= 0 ? '+' : '' }}{{ chart.change.toFixed(2) }}%
        </span>
      </div>
      <svg :viewBox="`0 0 ${width} ${height}`" class="svg">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1989fa" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#1989fa" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <path :d="chart.areaPath" fill="url(#areaGrad)" />
        <path :d="chart.linePath" fill="none" stroke="#1989fa" stroke-width="2" stroke-linejoin="round" />
        <circle
          v-for="(p, idx) in chart.coords"
          :key="idx"
          :cx="p.x"
          :cy="p.y"
          r="2.5"
          fill="#1989fa"
        />
      </svg>
      <div class="axis">
        <span>{{ data[0]?.date?.slice(5) }}</span>
        <span>{{ data[data.length - 1]?.date?.slice(5) }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.price-chart {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}
.summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}
.current {
  font-size: 22px;
  font-weight: 700;
  color: #323233;
}
.change {
  font-size: 13px;
}
.change.up {
  color: #ee0a24;
}
.change.down {
  color: #07c160;
}
.svg {
  width: 100%;
  height: auto;
  display: block;
}
.axis {
  display: flex;
  justify-content: space-between;
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}
.empty {
  color: #969799;
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
}
</style>
