<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { PriceHistoryPoint } from '@/api/nft';

const PERIODS = [7, 15, 30] as const;

const props = defineProps<{
  data: PriceHistoryPoint[];
}>();

const currentPeriod = ref<(typeof PERIODS)[number]>(30);
const chartCanvas = ref<HTMLCanvasElement | null>(null);

const periodData = computed(() => {
  const prices = props.data.map((p) => p.price);
  if (!prices.length) return [];
  const len = Math.min(currentPeriod.value, prices.length);
  return prices.slice(-len);
});

const chartMeta = computed(() => {
  const data = periodData.value;
  if (!data.length) {
    return { price: 0, changePct: 0, rangeStart: '', rangeEnd: '' };
  }
  const first = data[0];
  const last = data[data.length - 1];
  const pct = first ? ((last - first) / first) * 100 : 0;
  const history = props.data.slice(-data.length);
  return {
    price: last,
    changePct: pct,
    rangeStart: formatChartDate(history[0]?.date),
    rangeEnd: formatChartDate(history[history.length - 1]?.date),
  };
});

function formatChartDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(5);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMoney(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function drawChart() {
  const canvas = chartCanvas.value;
  const data = periodData.value;
  if (!canvas || data.length < 2) return;

  const wrap = canvas.parentElement;
  if (!wrap) return;

  const accentColor = '#c96442';
  const gridColor = 'rgba(240,238,230,0.8)';
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight || 180;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const padTop = 8;
  const padBot = 24;
  const chartW = w;
  const chartH = h - padTop - padBot;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const yPad = range * 0.15;
  const yMin = minVal - yPad;
  const yMax = maxVal + yPad;

  const xPos = (i: number) => (i / (data.length - 1)) * chartW;
  const yPos = (v: number) => padTop + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridLines = 4;
  for (let g = 0; g <= gridLines; g += 1) {
    const gy = padTop + (g / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  ctx.beginPath();
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  grad.addColorStop(0, 'rgba(201,100,66,0.35)');
  grad.addColorStop(1, 'rgba(201,100,66,0.02)');
  ctx.moveTo(xPos(0), yPos(data[0]));
  for (let i = 1; i < data.length; i += 1) {
    const cpx = (xPos(i - 1) + xPos(i)) / 2;
    ctx.bezierCurveTo(cpx, yPos(data[i - 1]), cpx, yPos(data[i]), xPos(i), yPos(data[i]));
  }
  ctx.lineTo(xPos(data.length - 1), padTop + chartH);
  ctx.lineTo(xPos(0), padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(data[0]));
  for (let j = 1; j < data.length; j += 1) {
    const cpx2 = (xPos(j - 1) + xPos(j)) / 2;
    ctx.bezierCurveTo(cpx2, yPos(data[j - 1]), cpx2, yPos(data[j]), xPos(j), yPos(data[j]));
  }
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const lastX = xPos(data.length - 1);
  const lastY = yPos(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function onResize() {
  drawChart();
}

function switchPeriod(period: (typeof PERIODS)[number]) {
  currentPeriod.value = period;
}

watch(currentPeriod, async () => {
  await nextTick();
  drawChart();
});

watch(
  () => props.data,
  async () => {
    await nextTick();
    drawChart();
  },
  { deep: true },
);

onMounted(() => {
  drawChart();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<template>
  <section class="sm-price-chart price-chart-section">
    <div class="section-title">近30日价格走势</div>
    <div class="chart-card">
      <div class="chart-meta">
        <span class="chart-price num">¥{{ formatMoney(chartMeta.price) }}</span>
        <span class="chart-change" :class="chartMeta.changePct >= 0 ? 'up' : 'down'">
          {{ chartMeta.changePct >= 0 ? '+' : '' }}{{ chartMeta.changePct.toFixed(2) }}%
        </span>
      </div>
      <div class="chart-period-tabs">
        <button
          v-for="period in PERIODS"
          :key="period"
          type="button"
          :class="{ active: currentPeriod === period }"
          @click="switchPeriod(period)"
        >
          {{ period }}日
        </button>
      </div>
      <div class="chart-canvas-wrap">
        <canvas v-if="periodData.length >= 2" ref="chartCanvas" />
        <div v-else class="chart-empty">暂无足够价格数据</div>
      </div>
      <div v-if="periodData.length >= 2" class="chart-range">
        <span>{{ chartMeta.rangeStart }}</span>
        <span>{{ chartMeta.rangeEnd }}</span>
      </div>
    </div>
  </section>
</template>
