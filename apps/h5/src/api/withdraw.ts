import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface WithdrawConfig {
  min: number;
  max: number;
  fee: number;
  feeRate: number;
  methods: Array<'bank' | 'wechat' | 'alipay'>;
  requireKyc: boolean;
}

export interface WithdrawRecord {
  id: number;
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

export function fetchWithdrawConfig() {
  return request.get<unknown, WithdrawConfig>('/withdraw/config');
}

export function applyWithdraw(data: {
  amount: number;
  method: 'bank' | 'wechat' | 'alipay';
  accountInfo: Record<string, string>;
}) {
  return request.post<
    unknown,
    { withdrawId: number; status: string; amount: number; fee: number; actualAmount: number }
  >('/withdraw', data);
}

export function fetchWithdrawRecords(params?: { status?: string; page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<WithdrawRecord>>('/withdraw/records', { params });
}
