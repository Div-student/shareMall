import request from '@/api/request';
import type { CheckinPlan, FundAccount, FundRecord, PageResult } from '@sharemall/shared';

export function fetchFundAccount() {
  return request.get<unknown, FundAccount>('/fund/account');
}

export function fetchFundRecords(params?: { page?: number; pageSize?: number; assetType?: string }) {
  return request.get<unknown, PageResult<FundRecord>>('/fund/records', { params });
}

export function startCheckin(tier: number) {
  return request.post<unknown, CheckinPlan & { planId: number }>('/fund/checkin/start', { tier });
}

export function signCheckin(planId: number) {
  return request.post<
    unknown,
    { cashoutAmount: number; signedDays: number; plan: CheckinPlan }
  >('/fund/checkin/sign', { planId });
}

export function fetchCheckinPlan(planId: number) {
  return request.get<unknown, CheckinPlan>(`/fund/checkin/${planId}`);
}

export function fetchCheckinRecords(planId: number) {
  return request.get<
    unknown,
    { list: { dayIndex: number; checkinDate: string; status: string; cashoutAmount: number }[] }
  >(`/fund/checkin/${planId}/records`);
}
