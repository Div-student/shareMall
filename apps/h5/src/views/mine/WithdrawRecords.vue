<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithdrawRecords, type WithdrawRecord } from '@/api/withdraw';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

type FilterKey = 'all' | 'pending' | 'success' | 'rejected';

const TABS: { key: FilterKey; label: string; apiStatus: string }[] = [
  { key: 'all', label: '全部', apiStatus: 'all' },
  { key: 'pending', label: '申请中', apiStatus: 'pending' },
  { key: 'success', label: '已到账', apiStatus: 'paid' },
  { key: 'rejected', label: '已驳回', apiStatus: 'rejected' },
];

const router = useRouter();
const loading = ref(true);
const activeFilter = ref<FilterKey>('all');
const records = ref<WithdrawRecord[]>([]);

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/withdraw');
  }
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function methodText(item: WithdrawRecord) {
  if (item.method === 'wechat') return '微信零钱';
  if (item.method === 'alipay') return '支付宝';
  if (item.method === 'bank') {
    const card = item.accountInfo?.cardNo ?? '';
    const digits = card.replace(/\D/g, '');
    const tail = digits.slice(-4) || card.slice(-4) || '****';
    return `银行卡 (尾号${tail})`;
  }
  return item.methodLabel;
}

function statusTag(item: WithdrawRecord) {
  if (item.status === 'paid') {
    return { label: '已到账', class: 'tag-success' };
  }
  if (item.status === 'rejected' || item.status === 'failed') {
    return { label: '已驳回', class: 'tag-danger' };
  }
  return { label: '申请中', class: 'tag-warn' };
}

async function load() {
  loading.value = true;
  try {
    const tab = TABS.find((t) => t.key === activeFilter.value) ?? TABS[0];
    const res = await fetchWithdrawRecords({ status: tab.apiStatus, page: 1, pageSize: 50 });
    records.value = res.list;
  } finally {
    loading.value = false;
  }
}

function switchFilter(key: FilterKey) {
  if (activeFilter.value === key) return;
  activeFilter.value = key;
  load();
}

onMounted(load);
</script>

<template>
  <div class="page-shop withdraw-records-page">
    <SmAppHeader title="提现记录" fixed @back="goBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else class="page-body withdraw-records-body">
      <div class="page-content">
        <div class="tab-filter">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            type="button"
            class="tab-btn"
            :class="{ active: activeFilter === tab.key }"
            @click="switchFilter(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="records.length" class="record-list">
          <div v-for="item in records" :key="item.id" class="record-card">
            <div class="record-top">
              <div>
                <div class="record-amount">
                  <span class="yuan">¥</span>{{ formatAmount(item.amount) }}
                </div>
              </div>
              <span class="tag" :class="statusTag(item).class">{{ statusTag(item).label }}</span>
            </div>
            <div class="record-meta">
              <span class="record-method">{{ methodText(item) }}</span>
              <span class="record-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div
              v-if="(item.status === 'rejected' || item.status === 'failed') && item.rejectReason"
              class="record-reason"
            >
              驳回原因：{{ item.rejectReason }}
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <p>暂无记录</p>
        </div>
      </div>
    </main>
  </div>
</template>
