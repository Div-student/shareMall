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
  activePlan?: CheckinPlan | null;
  rules?: {
    checkinDays: number;
    missRule: string;
    deductLimitRate: number;
  };
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

/** 商品列表排序 */
export type ProductSort = 'default' | 'price_asc' | 'price_desc' | 'sales';

/** 分类（列表项） */
export interface CategoryItem {
  id: number;
  name: string;
  icon?: string | null;
}

/** 分类树（一级 + 二级） */
export interface CategoryTreeItem extends CategoryItem {
  children: Pick<CategoryItem, 'id' | 'name'>[];
}

/** 商品 SKU */
export interface ProductSku {
  id: number;
  spec: Record<string, string>;
  price: number;
  stock: number;
  skuImage?: string | null;
}

/** 商品详情 */
export interface ProductDetail {
  id: number;
  title: string;
  mainImage: string;
  images: string[];
  detailHtml: string;
  price: number;
  marketPrice: number | null;
  fundRatio: number;
  fundAmount: number;
  allowFundDeduct: boolean;
  deductLimitRate: number | null;
  sales: number;
  categoryId: number;
  skus: ProductSku[];
}

/** 首页聚合 */
export interface HomeData {
  banners: { id: number; image: string; link?: string | null }[];
  categories: { id: number; name: string; icon?: string | null }[];
  products: ProductListItem[];
}

/** 下单试算结果 */
export interface OrderPreview {
  totalAmount: number;
  fundDeductMax: number;
  fundDeductAmount: number;
  couponAmount?: number;
  freight: number;
  payAmount: number;
  accruedFund: number;
}

/** 购物车项 */
export interface CartItem {
  id: number;
  productId: number;
  skuId: number;
  title: string;
  mainImage: string;
  spec: Record<string, string>;
  price: number;
  quantity: number;
  checked: boolean;
  stock: number;
  fundAmount: number;
  lineAmount: number;
}

/** 收货地址 */
export interface UserAddress {
  id: number;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  fullAddress: string;
}

/** 订单列表项 */
export interface OrderListItem {
  id: number;
  orderNo: string;
  status: string;
  payAmount: number;
  totalAmount: number;
  fundDeductAmount: number;
  accruedFund: number;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    title: string;
    mainImage: string;
    price: number;
    quantity: number;
  }[];
}

/** 订单详情 */
export interface OrderDetail extends Omit<OrderListItem, 'items'> {
  address: Record<string, string>;
  couponAmount: number;
  freight: number;
  payMethod?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  receivedAt?: string | null;
  items: {
    id: number;
    productId: number;
    skuId: number | null;
    title: string;
    mainImage: string;
    spec: Record<string, string>;
    price: number;
    quantity: number;
    itemFund: number;
  }[];
  reviewed?: boolean;
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

/** 用户消息 */
export interface UserMessage {
  id: number;
  type: 'system' | 'order' | 'trade';
  title: string;
  content: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

/** 订单评价 */
export interface OrderReview {
  id: number;
  rating: number;
  content: string;
  images: string[];
  isAnonymous: boolean;
  status: 'shown' | 'hidden';
  adminReply?: string | null;
  createdAt: string;
}

/** 商品评价（公开列表） */
export interface ProductReviewItem {
  id: number;
  rating: number;
  content: string;
  images: string[];
  nickname: string;
  adminReply?: string | null;
  createdAt: string;
}

export type { OrderStatus };
