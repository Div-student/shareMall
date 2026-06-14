import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';

const CONFIG_GROUP = 'order_feed';
const CONFIG_KEY = 'rules';

export interface OrderFeedRules {
  enabled: boolean;
  minDisplay: number;
  mockTemplates: string[];
}

const DEFAULT_RULES: OrderFeedRules = {
  enabled: true,
  minDisplay: 5,
  mockTemplates: [
    '用户{phone}刚刚下单了本商品',
    '{phone}用户 1 分钟前购买了本商品',
    '{phone}用户刚刚加入购物车',
  ],
};

@Injectable()
export class OrderFeedConfigService implements OnModuleInit {
  constructor(@InjectRepository(ConfigEntity) private readonly configs: Repository<ConfigEntity>) {}

  async onModuleInit() {
    const existing = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!existing) {
      await this.configs.save(
        this.configs.create({
          group: CONFIG_GROUP,
          key: CONFIG_KEY,
          value: DEFAULT_RULES as unknown as Record<string, unknown>,
        }),
      );
    }
  }

  async getRules(): Promise<OrderFeedRules> {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    return (row?.value ?? DEFAULT_RULES) as OrderFeedRules;
  }

  async saveRules(rules: OrderFeedRules) {
    let row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) {
      row = this.configs.create({
        group: CONFIG_GROUP,
        key: CONFIG_KEY,
        value: rules as unknown as Record<string, unknown>,
      });
    } else {
      row.value = rules as unknown as Record<string, unknown>;
    }
    await this.configs.save(row);
    return rules;
  }
}
