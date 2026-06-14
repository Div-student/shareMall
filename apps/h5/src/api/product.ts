import request from '@/api/request';
import type {
  CategoryTreeItem,
  HomeData,
  PageResult,
  ProductDetail,
  ProductListItem,
  ProductSort,
} from '@sharemall/shared';

export function fetchHome() {
  return request.get<unknown, HomeData>('/home');
}

export function fetchCategories() {
  return request.get<unknown, { list: CategoryTreeItem[] }>('/categories');
}

export function fetchProducts(params?: {
  categoryId?: number;
  parentCategoryId?: number;
  keyword?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<ProductListItem>>('/products', { params });
}

export function fetchProductDetail(id: number | string) {
  return request.get<unknown, ProductDetail>(`/products/${id}`);
}

export function fetchProductOrderFeed(id: number | string) {
  return request.get<unknown, { list: Array<{ text: string; time: string }> }>(`/products/${id}/order-feed`);
}
