import request from '@/api/request';
import type { PageResult } from '@sharemall/shared';

export interface PriceHistoryPoint {
  date: string;
  price: number;
  changePct: number;
}

export interface NftItem {
  id: number;
  name: string;
  cover: string;
  publisher: string;
  startPrice: number;
  currentPrice: number;
  exchangeFund: number;
  dealPriceMin: number;
  dealPriceMax: number;
  stock: number;
  totalSupply: number;
  limitPerUser: number;
}

export interface NftDetail extends NftItem {
  rightsDesc: string;
  soldCount: number;
  dealPremiumPct: number;
  priceHistory: PriceHistoryPoint[];
}

export interface UserNftItem {
  id: number;
  nftId: number;
  name: string;
  cover: string;
  serialNo: string;
  status: 'holding' | 'listed' | 'sold' | 'transferred';
  source: string;
  acquiredAt: string;
  currentPrice?: number;
}

export interface UserNftDetail extends UserNftItem {
  dealPriceMin: number;
  dealPriceMax: number;
  activeListing: {
    id: number;
    price: number;
    feeRate: number;
    createdAt: string;
  } | null;
}

export interface TradeConfig {
  enabled: boolean;
  feeRate: number;
  minPrice: number;
  maxPrice: number;
  requireKyc: boolean;
  dailyFluctuationPct: number;
  dealPremiumPct: number;
}

export interface NftListingItem {
  id: number;
  userNftId: number;
  referencePrice: number;
  dealPriceMin: number;
  dealPriceMax: number;
  price: number;
  feeRate: number;
  fee: number;
  estimateIncome: number;
  status: 'listing' | 'sold' | 'cancelled' | 'removed';
  createdAt: string;
  nftId: number;
  name: string;
  cover: string;
  serialNo: string;
  sellerId: number;
  sellerName: string;
}

export interface TradeMarketResult {
  enabled: boolean;
  dealPremiumPct: number;
  list: NftListingItem[];
  total: number;
}

export interface TradeRecordItem {
  id: number;
  role: 'buy' | 'sell';
  nftName: string;
  cover: string;
  serialNo: string;
  price: number;
  referencePrice: number;
  fee: number;
  sellerIncome: number;
  tradedAt: string;
}

export function fetchNftMarket(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<NftItem>>('/nft', { params });
}

export function fetchNftDetail(id: number | string) {
  return request.get<unknown, NftDetail>(`/nft/${id}`);
}

export function fetchNftPriceHistory(id: number | string, days = 30) {
  return request.get<unknown, PriceHistoryPoint[]>(`/nft/${id}/price-history`, { params: { days } });
}

export function exchangeNft(id: number | string) {
  return request.post<
    unknown,
    {
      success: boolean;
      userNftId: number;
      serialNo: string;
      dealPrice: number;
      referencePrice: number;
      exchangeFund: number;
    }
  >(`/nft/${id}/exchange`);
}

export function fetchMyNfts(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<UserNftItem>>('/nft/mine', { params });
}

export function fetchUserNftDetail(userNftId: number | string) {
  return request.get<unknown, UserNftDetail>(`/nft/mine/${userNftId}`);
}

export function fetchTradeConfig() {
  return request.get<unknown, TradeConfig>('/nft/trade/config');
}

export function fetchTradeMarket(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, TradeMarketResult>('/nft/trade', { params });
}

export function createListing(data: { userNftId: number }) {
  return request.post<
    unknown,
    {
      listingId: number;
      referencePrice: number;
      dealPriceMin: number;
      dealPriceMax: number;
      fee: number;
      feeRate: number;
      estimateIncome: number;
    }
  >('/nft/listings', data);
}

export function fetchMyListings(params?: { page?: number; pageSize?: number }) {
  return request.get<unknown, PageResult<NftListingItem>>('/nft/listings', { params });
}

export function refreshListing(id: number) {
  return request.put<
    unknown,
    {
      success: boolean;
      referencePrice: number;
      dealPriceMin: number;
      dealPriceMax: number;
      fee: number;
      estimateIncome: number;
    }
  >(`/nft/listings/${id}`);
}

export function cancelListing(id: number) {
  return request.delete<unknown, { success: boolean }>(`/nft/listings/${id}`);
}

export function buyListing(listingId: number | string) {
  return request.post<
    unknown,
    {
      success: boolean;
      tradeId: number;
      userNftId: number;
      price: number;
      referencePrice: number;
      fee: number;
      sellerIncome: number;
    }
  >(`/nft/trade/${listingId}/buy`);
}

export function fetchTradeRecords(params?: {
  page?: number;
  pageSize?: number;
  type?: 'buy' | 'sell' | 'all';
}) {
  return request.get<unknown, PageResult<TradeRecordItem>>('/nft/trade/records', { params });
}
