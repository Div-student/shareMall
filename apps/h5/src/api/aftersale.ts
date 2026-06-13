import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AftersaleItem {
  id: number;
  orderId: number;
  orderNo: string;
  type: string;
  typeLabel: string;
  reason: string;
  refundAmount: number;
  fundRollback: number;
  fundVoid: number;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export function applyAftersale(data: {
  orderId: number;
  type: 'refund_only' | 'return_refund';
  reason: string;
  evidence?: string[];
}) {
  return request.post<unknown, { id: number; status: string; refundAmount: number }>('/aftersale', data);
}

export function fetchAftersaleList(params?: { status?: string; page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<AftersaleItem>>('/aftersale', { params });
}

export function fetchAftersaleDetail(id: number | string) {
  return request.get<unknown, AftersaleItem>(`/aftersale/${id}`);
}
