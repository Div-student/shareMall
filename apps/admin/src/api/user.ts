import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminUserItem {
  id: number;
  phone: string;
  nickname: string;
  kycStatus: string;
  status: string;
  inviteCode: string;
  availableFund: number;
  withdrawableCash: number;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserItem {
  avatar: string;
  gender: string;
  birthday: string | null;
  inviterPhone: string | null;
  invitedCount: number;
  lastLoginAt: string | null;
  fund: {
    pendingFund: number;
    availableFund: number;
    withdrawableCash: number;
  };
}

export function fetchAdminUsers(params?: { keyword?: string; page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<AdminUserItem>>('/admin/users', { params });
}

export function fetchAdminUserDetail(id: number) {
  return request.get<unknown, AdminUserDetail>(`/admin/users/${id}`);
}
