import request from '@/api/request';

export interface FundRules {
  defaultRatio: number;
  tiers: number[];
  checkinDays: number;
  missRule: 'void' | 'makeup';
  deductLimitRate: number;
  marketFeeRate: number;
}

export function fetchFundRules() {
  return request.get<unknown, FundRules>('/admin/fund/rules');
}

export function saveFundRules(data: FundRules) {
  return request.put<unknown, FundRules>('/admin/fund/rules', data);
}

export function accruePendingFund(phone: string, amount: number, remark?: string) {
  return request.post<unknown, { success: boolean }>('/admin/fund/accrue', { phone, amount, remark });
}
