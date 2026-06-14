import request from '@/api/request';

export interface UserCouponItem {
  id: number;
  status: string;
  coupon: {
    id: number;
    name: string;
    type: 'fixed' | 'discount';
    value: number;
    minAmount: number;
  } | null;
}

export interface ServiceConfig {
  phone: string;
  wechat: string;
  workTime: string;
  onlineUrl: string;
  faq: Array<{ question: string; answer: string; sort: number }>;
}

export function fetchClaimableCoupons() {
  return request.get<unknown, { list: Array<{ id: number; name: string; claimed: boolean }> }>(
    '/coupons/claimable',
  );
}

export function fetchMyCoupons() {
  return request.get<unknown, { list: UserCouponItem[] }>('/coupons/mine');
}

export function claimCoupon(couponId: number) {
  return request.post(`/coupons/${couponId}/claim`);
}

export function fetchCampaigns() {
  return request.get<unknown, { list: Array<{ id: number; title: string; subtitle: string }> }>(
    '/campaigns',
  );
}

export function fetchServiceConfig() {
  return request.get<unknown, ServiceConfig>('/service-config');
}
