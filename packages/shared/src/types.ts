import type { AssetType, FundTier, OrderStatus, WithdrawMethod } from './constants';

/** 统一接口响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 分页查询参数 */
export interface PageQuery {
  page?: number;
  pageSize?: number;
}

/** 资产账户（三类资产） */
export interface FundAccount {
  pendingFund: number;
  availableFund: number;
  withdrawableCash: number;
  tiers: { tier: FundTier; reached: boolean }[];
}

/** 资产流水 */
export interface FundRecord {
  id: number;
  assetType: AssetType;
  changeType: string;
  amount: number;
  balanceAfter: number;
  remark?: string;
  createdAt: string;
}

/** 商品（列表项） */
export interface ProductListItem {
  id: number;
  title: string;
  mainImage: string;
  price: number;
  /** 预计可获贡献金 */
  fundAmount: number;
  sales: number;
}

/** 下单试算结果 */
export interface OrderPreview {
  totalAmount: number;
  fundDeductMax: number;
  fundDeductAmount: number;
  freight: number;
  payAmount: number;
  accruedFund: number;
}

/** 打卡计划 */
export interface CheckinPlan {
  id: number;
  tier: FundTier;
  totalAmount: number;
  dailyAmount: number;
  totalDays: number;
  signedDays: number;
  cashedAmount: number;
  voidAmount: number;
  status: 'active' | 'completed' | 'terminated';
}

/** 提现申请 */
export interface WithdrawRequest {
  amount: number;
  method: WithdrawMethod;
  accountInfo: Record<string, unknown>;
}

export type { OrderStatus };
