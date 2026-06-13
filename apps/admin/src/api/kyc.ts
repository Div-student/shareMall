import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminKycItem {
  id: number;
  userId: number;
  phone: string;
  realName: string;
  idCardNo: string;
  status: 'pending' | 'passed' | 'rejected';
  rejectReason: string;
  createdAt: string;
  auditedAt: string | null;
}

export function fetchAdminKycList(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<AdminKycItem>>('/admin/kyc', { params });
}

export function auditAdminKyc(id: number, data: { action: 'pass' | 'reject'; reason?: string }) {
  return request.post<unknown, { success: boolean; status: string }>(`/admin/kyc/${id}/audit`, data);
}
