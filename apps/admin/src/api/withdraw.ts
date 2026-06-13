import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminWithdrawItem {
  id: number;
  userId: number;
  phone: string;
  kycStatus: string;
  amount: number;
  fee: number;
  actualAmount: number;
  method: string;
  methodLabel: string;
  accountInfo: Record<string, string>;
  status: string;
  rejectReason: string;
  createdAt: string;
  paidAt: string | null;
}

export function fetchAdminWithdrawList(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<AdminWithdrawItem>>('/admin/withdraw', { params });
}

export function auditAdminWithdraw(id: number, data: { action: 'pass' | 'reject'; reason?: string }) {
  return request.post<unknown, { success: boolean; status: string }>(
    `/admin/withdraw/${id}/audit`,
    data,
  );
}
