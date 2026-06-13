-- 贡献金流水：开启打卡时扣减待兑现贡献金
ALTER TABLE `fund_record`
  MODIFY `change_type` ENUM(
    'order_accrue',
    'checkin_start',
    'checkin_cashout',
    'order_deduct',
    'nft_exchange',
    'nft_trade_income',
    'aftersale_void',
    'aftersale_rollback',
    'withdraw',
    'task_reward'
  ) NOT NULL;
