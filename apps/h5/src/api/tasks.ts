import request from '@/api/request';

export interface TaskItem {
  id: number;
  name: string;
  type: string;
  description: string;
  rewardType: string;
  rewardValue: number;
  status: 'ongoing' | 'completed' | 'claimed';
  claimedAt?: string | null;
}

export function fetchTasks() {
  return request.get<unknown, { list: TaskItem[] }>('/tasks');
}

export function claimTask(taskId: number) {
  return request.post<unknown, { success: boolean; rewardType: string; rewardValue: number }>(
    `/tasks/${taskId}/claim`,
  );
}
