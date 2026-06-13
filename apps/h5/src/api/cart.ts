import request from '@/api/request';
import type { CartItem } from '@sharemall/shared';

export function fetchCart() {
  return request.get<unknown, { items: CartItem[]; totalAmount: number; totalFund: number }>('/cart');
}

export function addToCart(data: { productId: number; skuId?: number; quantity: number }) {
  return request.post<unknown, { id: number }>('/cart', data);
}

export function updateCartItem(id: number, quantity: number) {
  return request.put<unknown, { success: boolean }>(`/cart/${id}`, { quantity });
}

export function removeCartItem(id: number) {
  return request.delete<unknown, { success: boolean }>(`/cart/${id}`);
}
