<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { claimTask, fetchTasks, type TaskItem } from '@/api/tasks';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useFundStore } from '@/stores/fund';

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const claimingId = ref<number | null>(null);
const signing = ref(false);
const tasks = ref<TaskItem[]>([]);

const signTask = computed(() => tasks.value.find((t) => t.type === 'sign') ?? null);
const dailyTasks = computed(() => tasks.value.filter((t) => t.type === 'browse' || t.type === 'share'));
const growthTasks = computed(() => tasks.value.filter((t) => t.type === 'first_order' || t.type === 'invite'));

const signBtnText = computed(() => {
  if (signTask.value?.status === 'claimed') return '已签到 ✓';
  return '签到';
});

const signBtnClass = computed(() =>
  signTask.value?.status === 'claimed' ? 'signed' : 'not-signed',
);

const DISPLAY_DESC: Record<string, string> = {
  browse: '浏览3件商品即可完成',
  share: '分享1件商品即可完成',
  first_order: '首次下单并确认收货',
  invite: '邀请1位好友注册',
};

function taskDescription(item: TaskItem) {
  return DISPLAY_DESC[item.type] ?? item.description;
}

function formatReward(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function showProgress(type: string) {
  return type === 'browse' || type === 'first_order' || type === 'invite';
}

function taskProgress(item: TaskItem) {
  const targets: Record<string, number> = {
    browse: 3,
    first_order: 1,
    invite: 1,
  };
  const target = targets[item.type] ?? 1;
  let current = 0;
  let statusLabel = '未完成';

  if (item.status === 'claimed') {
    current = target;
    statusLabel = '已完成';
  } else if (item.status === 'completed') {
    current = target;
    statusLabel = '待领取';
  } else if (item.type === 'invite') {
    statusLabel = '进行中';
  }

  return {
    current,
    target,
    percent: target ? Math.round((current / target) * 100) : 0,
    statusLabel,
  };
}

function taskBtn(item: TaskItem) {
  if (item.status === 'claimed') {
    return { class: 'done', text: '已完成', disabled: true };
  }
  if (item.status === 'completed') {
    return { class: 'claim', text: '领取', disabled: false };
  }
  return { class: 'go', text: '去完成', disabled: false };
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchTasks();
    tasks.value = res.list;
  } finally {
    loading.value = false;
  }
}

async function doDailySign() {
  const task = signTask.value;
  if (!task || signing.value) return;
  if (task.status === 'claimed') {
    showToast('今日已签到');
    return;
  }
  if (task.status !== 'completed') {
    showToast('暂无法签到');
    return;
  }
  signing.value = true;
  try {
    const res = await claimTask(task.id);
    showToast(`签到成功！+${formatReward(res.rewardValue)} 贡献金`);
    await Promise.all([load(), fundStore.fetchAccount()]);
  } finally {
    signing.value = false;
  }
}

async function onTaskAction(item: TaskItem) {
  if (item.status === 'ongoing') {
    if (item.type === 'invite') {
      router.push('/mine/invite');
      return;
    }
    if (item.type === 'first_order' || item.type === 'browse') {
      router.push('/home');
      return;
    }
    if (item.type === 'share') {
      showToast('正在生成分享链接...');
      router.push('/mine/invite');
      return;
    }
    showToast('请先完成任务');
    return;
  }

  if (item.status !== 'completed' || claimingId.value != null) return;

  claimingId.value = item.id;
  try {
    const res = await claimTask(item.id);
    showToast(`领取成功 +${formatReward(res.rewardValue)} 贡献金`);
    await Promise.all([load(), fundStore.fetchAccount()]);
  } finally {
    claimingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop task-center-page">
    <SmAppHeader title="任务中心" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body task-center-body">
      <div class="page-content">
        <div v-if="signTask" class="checkin-card">
          <div class="checkin-card-left">
            <div class="checkin-card-title">每日签到</div>
            <div class="checkin-card-desc">每日签到可领取贡献金奖励</div>
            <div class="checkin-card-reward">+{{ formatReward(signTask.rewardValue) }} 贡献金</div>
          </div>
          <button
            type="button"
            class="checkin-card-btn"
            :class="signBtnClass"
            :disabled="signTask.status === 'claimed' || signing"
            @click="doDailySign"
          >
            {{ signing ? '签到中...' : signBtnText }}
          </button>
        </div>

        <section v-if="dailyTasks.length" class="task-section">
          <h3 class="task-section-title">每日任务</h3>
          <article v-for="item in dailyTasks" :key="item.id" class="task-card">
            <div class="task-icon" :class="`icon-${item.type === 'share' ? 'share' : 'browse'}`">
              <svg
                v-if="item.type === 'browse'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div class="task-info">
              <div class="task-name">{{ item.name }}</div>
              <div class="task-reward">
                +<span class="num">{{ formatReward(item.rewardValue) }}</span>
                {{ item.rewardType === 'fund' ? '贡献金' : '提现金' }} · {{ taskDescription(item) }}
              </div>
              <div v-if="showProgress(item.type)" class="task-progress">
                <div class="task-progress-bar">
                  <div class="task-progress-fill" :style="{ width: `${taskProgress(item).percent}%` }" />
                </div>
                <div class="task-progress-label">
                  <span>{{ taskProgress(item).current }}/{{ taskProgress(item).target }}</span>
                  <span>{{ taskProgress(item).statusLabel }}</span>
                </div>
              </div>
            </div>
            <div class="task-action">
              <button
                type="button"
                class="task-btn"
                :class="taskBtn(item).class"
                :disabled="taskBtn(item).disabled || claimingId === item.id"
                @click="onTaskAction(item)"
              >
                {{ claimingId === item.id ? '领取中...' : taskBtn(item).text }}
              </button>
            </div>
          </article>
        </section>

        <section v-if="growthTasks.length" class="task-section">
          <h3 class="task-section-title">成长任务</h3>
          <article v-for="item in growthTasks" :key="item.id" class="task-card">
            <div class="task-icon" :class="`icon-${item.type === 'invite' ? 'invite' : 'first-order'}`">
              <svg
                v-if="item.type === 'first_order'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b5cf6"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="task-info">
              <div class="task-name">{{ item.name }}</div>
              <div class="task-reward">
                +<span class="num">{{ formatReward(item.rewardValue) }}</span> 贡献金 · {{ taskDescription(item) }}
              </div>
              <div v-if="showProgress(item.type)" class="task-progress">
                <div class="task-progress-bar">
                  <div class="task-progress-fill" :style="{ width: `${taskProgress(item).percent}%` }" />
                </div>
                <div class="task-progress-label">
                  <span>{{ taskProgress(item).current }}/{{ taskProgress(item).target }}</span>
                  <span>{{ taskProgress(item).statusLabel }}</span>
                </div>
              </div>
            </div>
            <div class="task-action">
              <button
                type="button"
                class="task-btn"
                :class="taskBtn(item).class"
                :disabled="taskBtn(item).disabled || claimingId === item.id"
                @click="onTaskAction(item)"
              >
                {{ claimingId === item.id ? '领取中...' : taskBtn(item).text }}
              </button>
            </div>
          </article>
        </section>

        <van-empty v-if="!signTask && !dailyTasks.length && !growthTasks.length" description="暂无任务" />
      </div>
    </main>
  </div>
</template>
