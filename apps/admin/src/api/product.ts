import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminProduct {
  id: number;
  title: string;
  categoryId: number;
  categoryName: string;
  mainImage: string;
  images: string[];
  detailHtml: string;
  price: number;
  marketPrice: number | null;
  fundRatio: number | null;
  allowFundDeduct: boolean;
  status: 'on_sale' | 'off_shelf';
  sort: number;
  sales: number;
}

export interface AdminCategory {
  id: number;
  parentId: number;
  name: string;
  icon?: string | null;
  fundRatio: number | null;
  sort: number;
  status: string;
}

export function fetchAdminProducts(params?: {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<unknown, PageResult<AdminProduct>>('/admin/products', { params });
}

export function createAdminProduct(data: Partial<AdminProduct> & { title: string; categoryId: number; mainImage: string; price: number }) {
  return request.post<unknown, AdminProduct>('/admin/products', data);
}

export function updateAdminProduct(id: number, data: Partial<AdminProduct>) {
  return request.put<unknown, AdminProduct>(`/admin/products/${id}`, data);
}

export function fetchAdminCategories() {
  return request.get<unknown, { list: AdminCategory[] }>('/admin/categories');
}

export function createAdminCategory(data: {
  name: string;
  parentId?: number;
  icon?: string;
  fundRatio?: number;
  sort?: number;
}) {
  return request.post('/admin/categories', data);
}

export function updateAdminCategory(
  id: number,
  data: Partial<Pick<AdminCategory, 'name' | 'icon' | 'fundRatio' | 'sort' | 'status'>>,
) {
  return request.put(`/admin/categories/${id}`, data);
}
