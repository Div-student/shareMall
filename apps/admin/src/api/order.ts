import request from '@/api/request';
import type { OrderDetail, PageResult } from '@sharemall/shared';

export interface AdminOrderListItem {
  id: number;
  orderNo: string;
  userId: number;
  userPhone: string;
  status: string;
  payAmount: number;
  totalAmount: number;
  fundDeductAmount: number;
  accruedFund: number;
  payMethod?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  createdAt: string;
  itemCount: number;
  items: { title: string; quantity: number }[];
}

export interface AdminOrderDetail extends OrderDetail {
  userId: number;
  userPhone: string;
}

export function fetchAdminOrders(params?: {
  status?: string;
  orderNo?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<AdminOrderListItem>>('/admin/orders', { params });
}

export function fetchAdminOrderDetail(id: number) {
  return request.get<unknown, AdminOrderDetail>(`/admin/orders/${id}`);
}

export function shipAdminOrder(id: number) {
  return request.post<unknown, { success: boolean; orderNo: string; status: string; shippedAt: string }>(
    `/admin/orders/${id}/ship`,
  );
}
