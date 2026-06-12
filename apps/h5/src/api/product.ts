import request from '@/api/request';
import type { HomeData, PageResult, ProductDetail, ProductListItem } from '@sharemall/shared';

export function fetchHome() {
  return request.get<unknown, HomeData>('/home');
}

export function fetchProducts(params?: {
  categoryId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<ProductListItem>>('/products', { params });
}

export function fetchProductDetail(id: number | string) {
  return request.get<unknown, ProductDetail>(`/products/${id}`);
}
