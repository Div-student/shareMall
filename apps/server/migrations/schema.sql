-- shareMall 数据库 DDL (MySQL 8)
-- 详见 docs/数据库DDL.md
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============ 用户与账户 ============

CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号/登录账号',
  `password_hash` VARCHAR(100) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('unknown','male','female') NOT NULL DEFAULT 'unknown',
  `birthday` DATE DEFAULT NULL,
  `status` ENUM('normal','frozen','blacklist') NOT NULL DEFAULT 'normal',
  `kyc_status` ENUM('none','pending','passed','rejected') NOT NULL DEFAULT 'none',
  `invite_code` VARCHAR(20) NOT NULL COMMENT '本人邀请码',
  `inviter_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '邀请人',
  `register_ip` VARCHAR(45) DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_invite_code` (`invite_code`),
  KEY `idx_inviter` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

CREATE TABLE `user_kyc` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `real_name` VARCHAR(50) NOT NULL,
  `id_card_no` VARCHAR(255) NOT NULL COMMENT '身份证号(加密)',
  `status` ENUM('pending','passed','rejected') NOT NULL DEFAULT 'pending',
  `reject_reason` VARCHAR(255) DEFAULT NULL,
  `audited_by` BIGINT UNSIGNED DEFAULT NULL,
  `audited_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实名认证';

CREATE TABLE `invite_relation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inviter_id` BIGINT UNSIGNED NOT NULL,
  `invitee_id` BIGINT UNSIGNED NOT NULL,
  `invite_code` VARCHAR(20) NOT NULL,
  `reward_status` ENUM('pending','granted','none') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invitee` (`invitee_id`),
  KEY `idx_inviter` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请关系';

CREATE TABLE `address` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `receiver` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `province` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `district` VARCHAR(50) NOT NULL,
  `detail` VARCHAR(255) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

CREATE TABLE `fund_account` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `pending_fund` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '待兑现贡献金',
  `available_fund` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '可用贡献金',
  `withdrawable_cash` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '提现金',
  `frozen_cash` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '提现冻结中',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产账户(三类资产)';

-- ============ 商品与购物 ============

CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `sort` INT NOT NULL DEFAULT 0,
  `fund_ratio` DECIMAL(6,4) DEFAULT NULL COMMENT '分类级贡献金比例',
  `status` ENUM('show','hidden') NOT NULL DEFAULT 'show',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

CREATE TABLE `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(120) NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `main_image` VARCHAR(255) NOT NULL,
  `images` JSON DEFAULT NULL COMMENT '轮播图数组',
  `detail_html` MEDIUMTEXT,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `market_price` DECIMAL(12,2) DEFAULT NULL,
  `fund_ratio` DECIMAL(6,4) DEFAULT NULL COMMENT '单品贡献金比例(覆盖默认)',
  `allow_fund_deduct` TINYINT(1) NOT NULL DEFAULT 1,
  `deduct_limit_rate` DECIMAL(6,4) DEFAULT NULL COMMENT '抵扣占订单上限',
  `sales` INT NOT NULL DEFAULT 0,
  `status` ENUM('on_sale','off_shelf') NOT NULL DEFAULT 'off_shelf',
  `sort` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品';

CREATE TABLE `sku` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `spec` JSON NOT NULL COMMENT '规格组合',
  `price` DECIMAL(12,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `sku_image` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格';

CREATE TABLE `cart_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `checked` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车';

CREATE TABLE `banner` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `position` ENUM('home_top','home_grid','activity') NOT NULL DEFAULT 'home_top',
  `image` VARCHAR(255) NOT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `sort` INT NOT NULL DEFAULT 0,
  `start_at` DATETIME DEFAULT NULL,
  `end_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播/活动位';

-- ============ 订单与售后 ============

CREATE TABLE `order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `address_snapshot` JSON NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `fund_deduct_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '贡献金抵扣',
  `coupon_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `freight` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `pay_amount` DECIMAL(12,2) NOT NULL,
  `accrued_fund` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '本单累计待兑现贡献金',
  `status` ENUM('unpaid','paid','shipped','received','completed','closed') NOT NULL DEFAULT 'unpaid',
  `pay_method` ENUM('wechat','alipay','balance') DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `shipped_at` DATETIME DEFAULT NULL,
  `received_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单';

CREATE TABLE `order_item` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku_id` BIGINT UNSIGNED DEFAULT NULL,
  `product_snapshot` JSON NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL,
  `item_fund` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细';

CREATE TABLE `payment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `channel` ENUM('wechat','alipay') NOT NULL,
  `trade_no` VARCHAR(64) DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  UNIQUE KEY `uk_trade_no` (`trade_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录';

CREATE TABLE `aftersale` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('refund_only','return_refund') NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `evidence` JSON DEFAULT NULL,
  `refund_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `fund_rollback` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '回退已抵扣可用贡献金',
  `fund_void` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '冲销待兑现贡献金',
  `status` ENUM('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='售后';

-- ============ 贡献金体系 ============

CREATE TABLE `fund_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `asset_type` ENUM('pending_fund','available_fund','withdrawable_cash') NOT NULL,
  `change_type` ENUM('order_accrue','checkin_start','checkin_cashout','order_deduct','nft_exchange','nft_trade_buy','nft_trade_income','aftersale_void','aftersale_rollback','withdraw','task_reward') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL COMMENT '正负',
  `balance_after` DECIMAL(12,2) NOT NULL,
  `ref_type` ENUM('order','checkin','nft','withdraw','task') DEFAULT NULL,
  `ref_id` BIGINT UNSIGNED DEFAULT NULL,
  `remark` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_asset` (`user_id`,`asset_type`),
  KEY `idx_ref` (`ref_type`,`ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='贡献金/提现金流水';

CREATE TABLE `checkin_plan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `tier` INT NOT NULL COMMENT '档位金额 90/180/360/720',
  `total_amount` DECIMAL(12,2) NOT NULL,
  `daily_amount` DECIMAL(12,2) NOT NULL,
  `total_days` INT NOT NULL DEFAULT 30,
  `signed_days` INT NOT NULL DEFAULT 0,
  `cashed_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `void_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active','completed','terminated') NOT NULL DEFAULT 'active',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡兑现计划';

CREATE TABLE `checkin_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `day_index` INT NOT NULL,
  `checkin_date` DATE NOT NULL,
  `status` ENUM('signed','missed') NOT NULL,
  `cashout_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plan_day` (`plan_id`,`day_index`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日打卡记录';

CREATE TABLE `task` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('sign','invite','first_order','share','browse') NOT NULL,
  `reward_type` ENUM('fund','other') NOT NULL DEFAULT 'fund',
  `reward_value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `rule` JSON DEFAULT NULL,
  `status` ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务';

CREATE TABLE `task_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `task_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('ongoing','completed','claimed') NOT NULL DEFAULT 'ongoing',
  `claimed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_task` (`user_id`,`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务完成记录';

-- ============ 数字藏品 ============

CREATE TABLE `nft` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `cover` VARCHAR(255) NOT NULL,
  `publisher` VARCHAR(120) DEFAULT NULL,
  `total_supply` INT NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `exchange_fund` DECIMAL(12,2) NOT NULL COMMENT '兑换所需可用贡献金(同步当前价)',
  `start_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '起始价格',
  `current_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '当前参考价',
  `last_price_date` DATE DEFAULT NULL COMMENT '上次日波动更新日期',
  `limit_per_user` INT NOT NULL DEFAULT 0 COMMENT '0=不限',
  `rights_desc` TEXT,
  `status` ENUM('on_sale','off_shelf') NOT NULL DEFAULT 'off_shelf',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数字藏品定义';

CREATE TABLE `user_nft` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `nft_id` BIGINT UNSIGNED NOT NULL,
  `serial_no` VARCHAR(64) NOT NULL COMMENT '唯一编号/链上标识',
  `source` ENUM('exchange','trade_buy','transfer') NOT NULL,
  `status` ENUM('holding','listed','sold','transferred') NOT NULL DEFAULT 'holding',
  `acquired_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_serial` (`serial_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_nft` (`nft_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户持有藏品';

CREATE TABLE `nft_listing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_nft_id` BIGINT UNSIGNED NOT NULL,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `fee_rate` DECIMAL(6,4) NOT NULL COMMENT '手续费比例快照',
  `status` ENUM('listing','sold','cancelled','removed') NOT NULL DEFAULT 'listing',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_seller` (`seller_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品挂单';

CREATE TABLE `nft_trade` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT UNSIGNED NOT NULL,
  `buyer_id` BIGINT UNSIGNED NOT NULL,
  `seller_id` BIGINT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `reference_price` DECIMAL(12,2) DEFAULT NULL COMMENT '成交时参考价',
  `deal_premium_factor` DECIMAL(8,4) DEFAULT NULL COMMENT '成交随机因子0-1',
  `fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `seller_income` DECIMAL(12,2) NOT NULL COMMENT '入提现金 = price - fee',
  `traded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_listing` (`listing_id`),
  KEY `idx_buyer` (`buyer_id`),
  KEY `idx_seller` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品成交记录';

CREATE TABLE `nft_price_history` (
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

-- ============ 提现 ============

CREATE TABLE `withdrawal` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `actual_amount` DECIMAL(12,2) NOT NULL,
  `method` ENUM('bank','wechat','alipay') NOT NULL,
  `account_info` JSON NOT NULL COMMENT '收款账户(加密/脱敏)',
  `status` ENUM('pending','auditing','approved','paying','paid','rejected','failed') NOT NULL DEFAULT 'pending',
  `reject_reason` VARCHAR(255) DEFAULT NULL,
  `audited_by` BIGINT UNSIGNED DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现申请';

-- ============ 系统与配置 ============

CREATE TABLE `config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group` VARCHAR(30) NOT NULL COMMENT 'fund/withdraw/nft/sms/invite',
  `key` VARCHAR(60) NOT NULL,
  `value` JSON NOT NULL,
  `effective_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_group_key` (`group`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局配置';

CREATE TABLE `role` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `permissions` JSON DEFAULT NULL,
  `data_scope` VARCHAR(30) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台角色';

CREATE TABLE `admin_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(100) NOT NULL,
  `role_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台账号';

CREATE TABLE `operation_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` BIGINT UNSIGNED NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `detail` JSON DEFAULT NULL,
  `ip` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

SET FOREIGN_KEY_CHECKS = 1;
