<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCheckinRecords } from '@/api/fund';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';

interface CheckinRecordItem {
  dayIndex: number;
  checkinDate: string;
  status: string;
  cashoutAmount: number;
}

type CalCellKind = 'empty' | 'checked' | 'missed' | 'future';

interface CalCell {
  kind: CalCellKind;
  day?: number;
}

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const planId = ref<number | null>(null);
const records = ref<CheckinRecordItem[]>([]);
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());

const monthLabel = computed(() => `${viewYear.value}年${viewMonth.value + 1}月`);

const recordsByDate = computed(() => {
  const map = new Map<string, CheckinRecordItem>();
  for (const item of records.value) {
    const date = parseDate(item.checkinDate);
    if (!date) continue;
    map.set(dateKey(date.getFullYear(), date.getMonth(), date.getDate()), item);
  }
  return map;
});

const calendarCells = computed<CalCell[]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells: CalCell[] = [];
  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ kind: 'empty' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = startOfDay(new Date(year, month, day));
    const key = dateKey(year, month, day);
    const record = recordsByDate.value.get(key);

    if (cellDate > today) {
      cells.push({ kind: 'future', day });
    } else if (record) {
      cells.push({ kind: record.status === 'signed' ? 'checked' : 'missed', day });
    } else {
      cells.push({ kind: 'missed', day });
    }
  }

  return cells;
});

const monthRecords = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const today = startOfDay(new Date());

  return records.value
    .filter((item) => {
      const date = parseDate(item.checkinDate);
      if (!date) return false;
      return date.getFullYear() === year && date.getMonth() === month && date <= today;
    })
    .sort((a, b) => {
      const da = parseDate(a.checkinDate)?.getTime() ?? 0;
      const db = parseDate(b.checkinDate)?.getTime() ?? 0;
      return db - da;
    });
});

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return startOfDay(date);
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${month + 1}-${day}`;
}

function formatRecordDate(value: string) {
  const date = parseDate(value);
  if (!date) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recordStatusText(status: string) {
  return status === 'signed' ? '打卡兑现' : '漏卡作废';
}

function recordStatusClass(status: string) {
  return status === 'signed' ? 'earned' : 'voided';
}

function recordAmountText(item: CheckinRecordItem) {
  if (item.status === 'signed') return `+¥${formatMoney(item.cashoutAmount)}`;
  return '¥0.00';
}

function recordAmountClass(item: CheckinRecordItem) {
  if (item.status === 'signed') return 'positive';
  return 'negative';
}

function changeMonth(delta: number) {
  let month = viewMonth.value + delta;
  let year = viewYear.value;
  if (month < 0) {
    month = 11;
    year -= 1;
  } else if (month > 11) {
    month = 0;
    year += 1;
  }
  viewMonth.value = month;
  viewYear.value = year;
}

async function load() {
  loading.value = true;
  try {
    await fundStore.fetchAccount();
    const active = fundStore.account?.activePlan;
    if (!active) {
      planId.value = null;
      records.value = [];
      return;
    }
    planId.value = active.id;
    const res = await fetchCheckinRecords(active.id);
    records.value = res.list;

    const latest = records.value
      .map((item) => parseDate(item.checkinDate))
      .filter((date): date is Date => date != null)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (latest) {
      viewYear.value = latest.getFullYear();
      viewMonth.value = latest.getMonth();
    } else {
      const now = new Date();
      viewYear.value = now.getFullYear();
      viewMonth.value = now.getMonth();
    }
  } finally {
    loading.value = false;
  }
}

onMounted(load);
onActivated(load);
</script>

<template>
  <div class="page-shop checkin-records-page">
    <SmAppHeader title="兑现记录" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else-if="!planId" class="page-body">
      <div class="page-content">
        <div class="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>暂无进行中的打卡计划</p>
          <button type="button" class="btn btn-primary" @click="router.push('/fund/checkin')">
            去开启打卡
          </button>
        </div>
      </div>
    </main>

    <main v-else class="page-body">
      <div class="page-content">
        <div class="month-selector">
          <button type="button" aria-label="上月" @click="changeMonth(-1)">
            <svg
              width="18"
              height="18"
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
          <span class="month-label">{{ monthLabel }}</span>
          <button type="button" aria-label="下月" @click="changeMonth(1)">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <section class="calendar-section">
          <div class="calendar-weekdays">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>
          <div class="calendar-grid">
            <template v-for="(cell, index) in calendarCells" :key="index">
              <div v-if="cell.kind === 'empty'" class="cal-day empty" />
              <div v-else class="cal-day" :class="cell.kind">
                <span class="day-num">{{ cell.day }}</span>
                <span v-if="cell.kind === 'checked'" class="day-icon">✓</span>
                <span v-else-if="cell.kind === 'missed'" class="day-icon">✗</span>
                <span v-else class="day-icon" />
              </div>
            </template>
          </div>
        </section>

        <div class="legend-row">
          <div class="legend-item">
            <div class="legend-dot checked-dot" />
            已打卡
          </div>
          <div class="legend-item">
            <div class="legend-dot missed-dot" />
            漏卡
          </div>
          <div class="legend-item">
            <div class="legend-dot future-dot" />
            未到
          </div>
        </div>

        <div class="section-gap" />

        <section class="records-section">
          <h3 class="records-title">兑现明细</h3>
          <div v-if="monthRecords.length" class="records-list">
            <div v-for="item in monthRecords" :key="`${item.dayIndex}-${item.checkinDate}`" class="record-item">
              <div class="record-left">
                <span class="record-date">{{ formatRecordDate(item.checkinDate) }}</span>
                <span class="record-status" :class="recordStatusClass(item.status)">
                  {{ recordStatusText(item.status) }}
                </span>
              </div>
              <span class="record-amount" :class="recordAmountClass(item)">
                {{ recordAmountText(item) }}
              </span>
            </div>
          </div>
          <div v-else class="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>本月暂无兑现记录</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
