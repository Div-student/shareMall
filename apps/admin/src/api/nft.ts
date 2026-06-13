import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface AdminNft {
  id: number;
  name: string;
  cover: string;
  publisher: string;
  totalSupply: number;
  stock: number;
  startPrice: number;
  currentPrice: number;
  exchangeFund: number;
  limitPerUser: number;
  rightsDesc: string;
  status: 'on_sale' | 'off_shelf';
  soldCount: number;
  lastPriceDate: string | null;
  createdAt: string;
}

export function fetchAdminNfts(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<AdminNft>>('/admin/nft', { params });
}

export function createAdminNft(data: {
  name: string;
  cover: string;
  publisher?: string;
  totalSupply: number;
  startPrice: number;
  limitPerUser?: number;
  rightsDesc?: string;
  status?: 'on_sale' | 'off_shelf';
}) {
  return request.post<unknown, AdminNft>('/admin/nft', data);
}

export function updateAdminNft(
  id: number,
  data: Partial<{
    name: string;
    cover: string;
    publisher: string;
    stock: number;
    startPrice: number;
    limitPerUser: number;
    rightsDesc: string;
    status: 'on_sale' | 'off_shelf';
  }>,
) {
  return request.put<unknown, AdminNft>(`/admin/nft/${id}`, data);
}

export interface AdminNftMarket {
  enabled: boolean;
  minPrice: number;
  maxPrice: number;
  requireKyc: boolean;
  dailyFluctuationPct: number;
  dealPremiumPct: number;
  feeRate: number;
}

export function fetchAdminNftMarket() {
  return request.get<unknown, AdminNftMarket>('/admin/nft/market');
}

export function updateAdminNftMarket(data: Partial<AdminNftMarket>) {
  return request.put<unknown, AdminNftMarket>('/admin/nft/market', data);
}
