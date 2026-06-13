import request from '@/api/request';

export interface AdminInfo {
  id: number;
  username: string;
  roleId: number | null;
  roleName: string;
  permissions: string[];
}

export interface PermissionOption {
  key: string;
  label: string;
}

export interface DashboardOverview {
  trade: {
    gmv: number;
    orderCount: number;
    avgOrderAmount: number;
    paymentSuccessRate: number;
  };
  user: {
    total: number;
    todayNew: number;
    inviteTotal: number;
  };
  fund: {
    pendingTotal: number;
    availableTotal: number;
    withdrawableTotal: number;
    deductTotal: number;
    activeCheckinUsers: number;
  };
  audit: {
    pendingWithdrawAmount: number;
    pendingKycCount: number;
    pendingAftersaleCount: number;
  };
  trend: { date: string; orderCount: number; gmv: number }[];
}

export interface RoleItem {
  id: number;
  name: string;
  permissions: string[];
  dataScope?: string | null;
  createdAt: string;
}

export interface AdminAccountItem {
  id: number;
  username: string;
  roleId: number | null;
  roleName: string;
  status: 'enabled' | 'disabled';
  createdAt: string;
}

export interface OperationLogItem {
  id: number;
  adminId: number;
  module: string;
  action: string;
  detail?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string;
}

export function adminLogin(data: { username: string; password: string }) {
  return request.post<
    unknown,
    { token: string; adminInfo: AdminInfo; permissionOptions: string[] }
  >('/admin/auth/login', data);
}

export function fetchAdminProfile() {
  return request.get<unknown, AdminInfo>('/admin/auth/profile');
}

export function fetchDashboardOverview() {
  return request.get<unknown, DashboardOverview>('/admin/dashboard/overview');
}

export function fetchRoles() {
  return request.get<unknown, { list: RoleItem[]; permissionOptions: PermissionOption[] }>(
    '/admin/roles',
  );
}

export function createRole(data: { name: string; permissions: string[]; dataScope?: string }) {
  return request.post('/admin/roles', data);
}

export function updateRole(
  id: number,
  data: { name: string; permissions: string[]; dataScope?: string },
) {
  return request.put(`/admin/roles/${id}`, data);
}

export function fetchAdminAccounts() {
  return request.get<unknown, { list: AdminAccountItem[] }>('/admin/accounts');
}

export function createAdminAccount(data: {
  username: string;
  password: string;
  roleId: number;
}) {
  return request.post('/admin/accounts', data);
}

export function updateAdminAccount(
  id: number,
  data: { roleId?: number; status?: 'enabled' | 'disabled'; password?: string },
) {
  return request.put(`/admin/accounts/${id}`, data);
}

export function fetchOperationLogs(params?: { module?: string; page?: number; pageSize?: number }) {
  return request.get<unknown, { list: OperationLogItem[]; total: number }>('/admin/logs', {
    params,
  });
}
