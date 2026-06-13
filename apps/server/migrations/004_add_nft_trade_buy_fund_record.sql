-- 二级市场购买扣减可用贡献金流水类型
ALTER TABLE `fund_record`
  MODIFY COLUMN `change_type` ENUM(
    'order_accrue',
    'checkin_start',
    'checkin_cashout',
    'order_deduct',
    'nft_exchange',
    'nft_trade_buy',
    'nft_trade_income',
    'aftersale_void',
    'aftersale_rollback',
    'withdraw',
    'task_reward'
  ) NOT NULL;
