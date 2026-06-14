import request from '@/api/request';

export type FinanceFlowCategory = 'payment' | 'withdraw' | 'fund' | 'nft';
export type FinanceReportType = 'trade' | 'fund' | 'withdraw' | 'nft';

export interface FinanceFlowQuery {
  category?: FinanceFlowCategory;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export interface FinanceReportQuery {
  type?: FinanceReportType;
  startDate?: string;
  endDate?: string;
}

export interface FinanceReconcileQuery {
  startDate?: string;
  endDate?: string;
}

export interface ReconcileItem {
  key: string;
  title: string;
  description: string;
  platformAmount: number;
  referenceAmount: number;
  diff: number;
  status: 'matched' | 'diff';
}

export function fetchFinanceFlow(params: FinanceFlowQuery) {
  return request.get<unknown, { list: Record<string, unknown>[]; total: number; category: string }>(
    '/admin/finance/flow',
    { params },
  );
}

export function fetchFinanceReports(params: FinanceReportQuery) {
  return request.get<
    unknown,
    {
      type: FinanceReportType;
      period: { startDate: string; endDate: string };
      summary: Record<string, number>;
      daily: Record<string, number | string>[];
    }
  >('/admin/finance/reports', { params });
}

export function fetchFinanceReconcile(params?: FinanceReconcileQuery) {
  return request.get<
    unknown,
    { period: { startDate: string; endDate: string }; items: ReconcileItem[] }
  >('/admin/finance/reconcile', { params });
}
