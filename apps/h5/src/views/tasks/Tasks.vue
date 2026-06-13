<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { claimTask, fetchTasks, type TaskItem } from '@/api/tasks';
import { useFundStore } from '@/stores/fund';

const router = useRouter();
const fundStore = useFundStore();
const loading = ref(true);
const claimingId = ref<number | null>(null);
const tasks = ref<TaskItem[]>([]);

const statusMap: Record<TaskItem['status'], string> = {
  ongoing: '去完成',
  completed: '领取',
  claimed: '已领取',
};

const typeIcon: Record<string, string> = {
  sign: 'checked',
  invite: 'friends-o',
  first_order: 'shopping-cart-o',
  browse: 'eye-o',
  share: 'share-o',
};

function rewardText(item: TaskItem) {
  const unit = item.rewardType === 'fund' ? '待兑现贡献金' : '提现金';
  return `+${item.rewardValue} ${unit}`;
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

async function onAction(item: TaskItem) {
  if (item.status === 'ongoing') {
    if (item.type === 'invite') {
      router.push('/mine/invite');
      return;
    }
    if (item.type === 'first_order') {
      router.push('/home');
      return;
    }
    if (item.type === 'browse') {
      router.push('/home');
      return;
    }
    showToast('请先完成任务');
    return;
  }

  if (item.status !== 'completed') return;

  claimingId.value = item.id;
  try {
    const res = await claimTask(item.id);
    showToast(`领取成功 +${res.rewardValue} 待兑现贡献金`);
    await Promise.all([load(), fundStore.fetchAccount()]);
  } finally {
    claimingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="任务中心" left-arrow @click-left="$router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <van-empty v-else-if="!tasks.length" description="暂无任务" />

    <van-cell-group v-else inset style="margin-top: 12px">
      <van-cell
        v-for="item in tasks"
        :key="item.id"
        :icon="typeIcon[item.type] ?? 'todo-list-o'"
        :title="item.name"
        :label="item.description"
      >
        <template #value>
          <div class="task-action">
            <span class="reward">{{ rewardText(item) }}</span>
            <van-button
              size="small"
              :type="item.status === 'completed' ? 'primary' : 'default'"
              :plain="item.status !== 'completed'"
              :disabled="item.status === 'claimed'"
              :loading="claimingId === item.id"
              @click.stop="onAction(item)"
            >
              {{ statusMap[item.status] }}
            </van-button>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-notice-bar
      wrapable
      :scrollable="false"
      text="完成任务可领取待兑现贡献金奖励，每日任务次日可再次领取。"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.task-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.reward {
  font-size: 12px;
  color: #ee0a24;
}
</style>
