-- 数字藏品动态价格：起始价、当前价、每日波动、价格历史

ALTER TABLE `nft`
  ADD COLUMN `start_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '起始价格(后台设置)' AFTER `exchange_fund`,
  ADD COLUMN `current_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '当前参考价(每日波动)' AFTER `start_price`,
  ADD COLUMN `last_price_date` DATE DEFAULT NULL COMMENT '上次日波动更新日期' AFTER `current_price`;

UPDATE `nft` SET `start_price` = `exchange_fund`, `current_price` = `exchange_fund` WHERE `start_price` = 0;

CREATE TABLE IF NOT EXISTS `nft_price_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nft_id` BIGINT UNSIGNED NOT NULL,
  `price_date` DATE NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `change_pct` DECIMAL(8,4) DEFAULT NULL COMMENT '相对前一日涨跌幅',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nft_date` (`nft_id`, `price_date`),
  KEY `idx_nft_id` (`nft_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品每日价格历史';

ALTER TABLE `nft_trade`
  ADD COLUMN `reference_price` DECIMAL(12,2) DEFAULT NULL COMMENT '成交时参考价' AFTER `price`,
  ADD COLUMN `deal_premium_factor` DECIMAL(8,4) DEFAULT NULL COMMENT '成交随机因子0-1' AFTER `reference_price`;
