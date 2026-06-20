import request from '@/api/request';
import type { UserAddress } from '@sharemall/shared';

export type AddressPayload = {
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
};

export function fetchAddresses() {
  return request.get<unknown, { list: UserAddress[] }>('/user/address');
}

export function createAddress(data: AddressPayload) {
  return request.post<unknown, UserAddress>('/user/address', data);
}

export function updateAddress(id: number, data: AddressPayload) {
  return request.put<unknown, UserAddress>(`/user/address/${id}`, data);
}

export function setDefaultAddress(id: number) {
  return request.put<unknown, UserAddress>(`/user/address/${id}/default`);
}

export function deleteAddress(id: number) {
  return request.delete<unknown, { ok: boolean }>(`/user/address/${id}`);
}
