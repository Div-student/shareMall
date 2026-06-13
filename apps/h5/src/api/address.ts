import request from '@/api/request';
import type { UserAddress } from '@sharemall/shared';

export function fetchAddresses() {
  return request.get<unknown, { list: UserAddress[] }>('/user/address');
}

export function createAddress(data: {
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
}) {
  return request.post<unknown, UserAddress>('/user/address', data);
}
