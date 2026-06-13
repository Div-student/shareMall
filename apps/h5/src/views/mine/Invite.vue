<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchInvite, type InviteInfo } from '@/api/user';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(true);
const inviteInfo = ref<InviteInfo | null>(null);

const inviteCode = computed(() => inviteInfo.value?.inviteCode ?? userStore.userInfo?.inviteCode ?? '');
const inviteLink = computed(() => {
  const origin = window.location.origin;
  return `${origin}/register?inviteCode=${inviteCode.value}`;
});

function formatTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label}已复制`);
  } catch {
    showToast('复制失败，请手动复制');
  }
}

async function load() {
  loading.value = true;
  try {
    inviteInfo.value = await fetchInvite();
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的邀请" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <template v-else>
      <div class="card">
        <div class="title">我的邀请码</div>
        <div class="code">{{ inviteCode }}</div>
        <div class="actions">
          <van-button size="small" type="primary" @click="copyText(inviteCode, '邀请码')">
            复制邀请码
          </van-button>
          <van-button size="small" plain type="primary" @click="copyText(inviteLink, '邀请链接')">
            复制链接
          </van-button>
        </div>
        <div class="count">已邀请 {{ inviteInfo?.invitedCount ?? 0 }} 人</div>
      </div>

      <van-cell-group inset title="邀请记录">
        <van-empty v-if="!inviteInfo?.list.length" description="暂无邀请记录" />
        <van-cell
          v-for="item in inviteInfo?.list ?? []"
          :key="item.id"
          :title="item.nickname || item.phone"
          :label="formatTime(item.createdAt)"
          :value="item.phone"
        />
      </van-cell-group>
    </template>

    <van-notice-bar
      wrapable
      :scrollable="false"
      text="好友通过您的邀请码注册后，您可在任务中心领取邀请奖励。"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.card {
  margin: 12px 16px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffd01e, #ff8917);
  color: #fff;
  text-align: center;
}
.title {
  font-size: 14px;
  opacity: 0.9;
}
.code {
  margin: 12px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.count {
  margin-top: 16px;
  font-size: 13px;
}
</style>
