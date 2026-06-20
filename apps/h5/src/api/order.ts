import request from '@/api/request';
import type { OrderDetail, OrderListItem, OrderPreview, PageResult } from '@sharemall/shared';

export interface OrderItemInput {
  skuId: number;
  quantity: number;
}

export function previewOrder(data: {
  items: OrderItemInput[];
  addressId: number;
  useFund?: boolean;
  fundAmount?: number;
  couponId?: number;
}) {
  return request.post<unknown, OrderPreview>('/orders/preview', data);
}

export function createOrder(data: {
  items: OrderItemInput[];
  addressId: number;
  useFund?: boolean;
  fundAmount?: number;
  couponId?: number;
}) {
  return request.post<unknown, { orderNo: string; orderId: number }>('/orders', data);
}

export function fetchOrders(params?: { status?: string; page?: number }) {
  return request.get<unknown, PageResult<OrderListItem>>('/orders', { params });
}

export function fetchOrderDetail(id: number | string) {
  return request.get<unknown, OrderDetail>(`/orders/${id}`);
}

export function payOrder(id: number | string, channel: 'wechat' | 'alipay' = 'wechat') {
  return request.post<unknown, { payParams: Record<string, unknown>; status: string; accruedFund: number }>(
    `/orders/${id}/pay`,
    { channel },
  );
}

export function fetchPayStatus(id: number | string) {
  return request.get<unknown, { status: string }>(`/orders/${id}/pay-status`);
}

export function receiveOrder(id: number | string) {
  return request.post<
    unknown,
    { success: boolean; status: string; receivedAt: string; accruedFund: number }
  >(`/orders/${id}/receive`);
}
