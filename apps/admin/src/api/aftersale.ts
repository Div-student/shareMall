import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminAftersaleItem {
  id: number;
  orderId: number;
  orderNo: string;
  userId: number;
  phone: string;
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

export function fetchAdminAftersaleList(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<AdminAftersaleItem>>('/admin/aftersale', { params });
}

export function auditAdminAftersale(id: number, data: { action: 'pass' | 'reject'; reason?: string }) {
  return request.post<
    unknown,
    { success: boolean; status: string; refundAmount?: number; fundRollback?: number; fundVoid?: number }
  >(`/admin/aftersale/${id}/audit`, data);
}
