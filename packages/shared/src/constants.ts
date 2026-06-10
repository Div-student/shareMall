/** 贡献金档位（单位：贡献金 = 元） */
export const FUND_TIERS = [90, 180, 360, 720] as const;
export type FundTier = (typeof FUND_TIERS)[number];

/** 默认打卡天数 */
export const DEFAULT_CHECKIN_DAYS = 30;

/** 1 贡献金 = 1 元 */
export const FUND_TO_CNY_RATE = 1;

/** 三类资产 */
export enum AssetType {
  /** 待兑现贡献金 */
  PendingFund = 'pending_fund',
  /** 可用贡献金（站内，不可提现） */
  AvailableFund = 'available_fund',
  /** 提现金（可提现余额） */
  WithdrawableCash = 'withdrawable_cash',
}

/** 资产变动类型 */
export enum FundChangeType {
  OrderAccrue = 'order_accrue',
  CheckinCashout = 'checkin_cashout',
  OrderDeduct = 'order_deduct',
  NftExchange = 'nft_exchange',
  NftTradeIncome = 'nft_trade_income',
  AftersaleVoid = 'aftersale_void',
  AftersaleRollback = 'aftersale_rollback',
  Withdraw = 'withdraw',
  TaskReward = 'task_reward',
}

/** 订单状态 */
export enum OrderStatus {
  Unpaid = 'unpaid',
  Paid = 'paid',
  Shipped = 'shipped',
  Received = 'received',
  Completed = 'completed',
  Closed = 'closed',
}

/** 提现方式 */
export enum WithdrawMethod {
  Bank = 'bank',
  Wechat = 'wechat',
  Alipay = 'alipay',
}

/** 统一响应码 */
export enum ApiCode {
  Success = 0,
  Fail = 1,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerError = 500,
}
