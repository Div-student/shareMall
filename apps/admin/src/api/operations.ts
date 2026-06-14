import request from '@/api/request';

export interface CouponItem {
  id: number;
  name: string;
  type: 'fixed' | 'discount';
  value: number;
  minAmount: number;
  total: number;
  claimed: number;
  used: number;
  status: 'enabled' | 'disabled';
  startAt?: string | null;
  endAt?: string | null;
}

export interface CampaignItem {
  id: number;
  title: string;
  subtitle: string;
  banner: string;
  content: string;
  type: string;
  status: 'draft' | 'active' | 'ended';
  participantCount: number;
  startAt?: string | null;
  endAt?: string | null;
}

export interface DictItem {
  id: number;
  group: string;
  code: string;
  label: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
}

export interface ServiceConfig {
  phone: string;
  wechat: string;
  workTime: string;
  onlineUrl: string;
  faq: Array<{ question: string; answer: string; sort: number }>;
}

export function fetchAdminCoupons(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, { list: CouponItem[]; total: number }>('/admin/coupons', { params });
}

export function saveAdminCoupon(data: Partial<CouponItem>, id?: number) {
  return id ? request.put(`/admin/coupons/${id}`, data) : request.post('/admin/coupons', data);
}

export function toggleCouponStatus(id: number, status: 'enabled' | 'disabled') {
  return request.post(`/admin/coupons/${id}/status`, { status });
}

export function fetchAdminCampaigns(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, { list: CampaignItem[]; total: number }>('/admin/campaigns', { params });
}

export function saveAdminCampaign(data: Partial<CampaignItem>, id?: number) {
  return id ? request.put(`/admin/campaigns/${id}`, data) : request.post('/admin/campaigns', data);
}

export function setCampaignStatus(id: number, status: 'draft' | 'active' | 'ended') {
  return request.post(`/admin/campaigns/${id}/status`, { status });
}

export function fetchAdminDicts(params?: { group?: string; page?: number }) {
  return request.get<unknown, { list: DictItem[]; total: number }>('/admin/dicts', { params });
}

export function fetchDictGroups() {
  return request.get<unknown, { list: Array<{ group: string; count: number }> }>('/admin/dicts/groups');
}

export function saveAdminDict(data: Partial<DictItem>, id?: number) {
  return id ? request.put(`/admin/dicts/${id}`, data) : request.post('/admin/dicts', data);
}

export function deleteAdminDict(id: number) {
  return request.post(`/admin/dicts/${id}/delete`);
}

export function fetchServiceConfig() {
  return request.get<unknown, ServiceConfig>('/admin/service-config');
}

export function saveServiceConfig(data: ServiceConfig) {
  return request.put('/admin/service-config', data);
}

export interface OrderFeedRules {
  enabled: boolean;
  minDisplay: number;
  mockTemplates: string[];
}

export function fetchOrderFeedConfig() {
  return request.get<unknown, OrderFeedRules>('/admin/order-feed');
}

export function saveOrderFeedConfig(data: OrderFeedRules) {
  return request.put('/admin/order-feed', data);
}

export function fetchAdminNotifications(params?: { page?: number; type?: string }) {
  return request.get<unknown, { list: Array<Record<string, unknown>>; total: number }>(
    '/admin/notifications',
    { params },
  );
}

export function broadcastNotification(data: {
  title: string;
  content: string;
  type?: string;
  target: 'all' | 'phones';
  phones?: string[];
}) {
  return request.post('/admin/notifications/broadcast', data);
}

export function fetchCheckinMonitor(params?: { status?: string; page?: number }) {
  return request.get<
    unknown,
    { list: Array<Record<string, unknown>>; total: number }
  >('/admin/fund/checkin-monitor', { params });
}
