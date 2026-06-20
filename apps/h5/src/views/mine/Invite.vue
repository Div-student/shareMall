<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchTasks } from '@/api/tasks';
import { fetchInvite, type InviteInfo } from '@/api/user';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { copyToClipboard } from '@/utils/clipboard';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(true);
const inviteInfo = ref<InviteInfo | null>(null);
const inviteReward = ref(5);

const inviteCode = computed(() => inviteInfo.value?.inviteCode ?? userStore.userInfo?.inviteCode ?? '');
const invitedCount = computed(() => inviteInfo.value?.invitedCount ?? 0);
const totalReward = computed(() => invitedCount.value * inviteReward.value);

const inviteLink = computed(() => {
  const origin = window.location.origin;
  return `${origin}/register?inviteCode=${encodeURIComponent(inviteCode.value)}`;
});

function formatReward(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function displayName(item: { nickname: string; phone: string }) {
  if (item.nickname?.trim()) return item.nickname.trim();
  return item.phone || '新用户';
}

function avatarText(item: { nickname: string; phone: string }) {
  const name = displayName(item);
  return name.slice(0, 1);
}

function formatRegisterDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 注册`;
}

async function copyText(text: string, label: string) {
  const ok = await copyToClipboard(text);
  showToast(ok ? `${label}已复制` : '复制失败，请手动复制');
}

function onSharePoster() {
  showToast('生成海报中...');
}

function onShareLink() {
  void copyText(inviteLink.value, '分享链接');
}

function onRules() {
  showToast('好友通过邀请码注册后，可在任务中心领取邀请奖励');
}

async function load() {
  loading.value = true;
  try {
    const [info, tasks] = await Promise.all([
      fetchInvite(),
      fetchTasks().catch(() => ({ list: [] })),
    ]);
    inviteInfo.value = info;
    const inviteTask = tasks.list.find((t) => t.type === 'invite');
    if (inviteTask) inviteReward.value = inviteTask.rewardValue;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop invite-page">
    <SmAppHeader title="我的邀请" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body invite-body">
      <div class="page-content">
        <div class="stats-card">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">
                {{ invitedCount }}<span class="unit"> 人</span>
              </span>
              <span class="stat-label">已邀请好友</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">¥{{ formatReward(totalReward) }}<span class="unit" /></span>
              <span class="stat-label">获得贡献金奖励</span>
            </div>
          </div>
        </div>

        <div class="invite-code-card">
          <div class="invite-code-label">我的邀请码</div>
          <div class="invite-code-value">{{ inviteCode }}</div>
          <div class="share-actions">
            <button type="button" class="share-btn" @click="copyText(inviteCode, '邀请码')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>复制邀请码</span>
            </button>
            <button type="button" class="share-btn" @click="onSharePoster">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>分享海报</span>
            </button>
            <button type="button" class="share-btn" @click="onShareLink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>分享链接</span>
            </button>
          </div>
        </div>

        <div class="section-title">最近邀请</div>
        <div v-if="inviteInfo?.list.length" class="invitee-list">
          <div v-for="item in inviteInfo.list" :key="item.id" class="invitee-item">
            <div class="invitee-avatar">{{ avatarText(item) }}</div>
            <div class="invitee-info">
              <div class="invitee-name">{{ displayName(item) }}</div>
              <div class="invitee-date">{{ formatRegisterDate(item.createdAt) }}</div>
            </div>
            <div class="invitee-reward">+¥{{ formatReward(inviteReward) }}</div>
          </div>
        </div>
        <div v-else class="invitee-empty">暂无邀请记录</div>

        <button type="button" class="rules-link" @click="onRules">
          邀请规则说明
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>
