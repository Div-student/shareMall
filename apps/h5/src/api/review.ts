import request from '@/api/request';
import type { OrderReview, PageResult, ProductReviewItem } from '@sharemall/shared';

export function fetchOrderReview(orderId: number | string) {
  return request.get<unknown, { reviewed: boolean; review: OrderReview | null }>(
    `/orders/${orderId}/review`,
  );
}

export function submitOrderReview(
  orderId: number | string,
  data: { rating: number; content: string; images?: string[]; isAnonymous?: boolean },
) {
  return request.post<unknown, { id: number; rating: number; content: string }>(
    `/orders/${orderId}/review`,
    data,
  );
}

export function fetchProductReviews(productId: number | string, params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<ProductReviewItem>>(`/products/${productId}/reviews`, { params });
}
