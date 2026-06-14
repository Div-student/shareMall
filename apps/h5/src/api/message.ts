import request from '@/api/request';
import type { PageResult, UserMessage } from '@sharemall/shared';

export function fetchMessages(params?: {
  type?: 'system' | 'order' | 'trade' | 'all';
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<UserMessage>>('/messages', { params });
}

export function fetchUnreadCount() {
  return request.get<unknown, { count: number }>('/messages/unread-count');
}

export function fetchMessageDetail(id: number | string) {
  return request.get<unknown, UserMessage>(`/messages/${id}`);
}

export function markMessageRead(id: number | string) {
  return request.post<unknown, { success: boolean }>(`/messages/${id}/read`);
}

export function markAllMessagesRead() {
  return request.post<unknown, { success: boolean }>('/messages/read-all');
}
