import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';

export interface NftMarketRules {
  enabled: boolean;
  minPrice: number;
  maxPrice: number;
  requireKyc: boolean;
  /** 每日价格波动幅度，如 0.05 表示 ±5% */
  dailyFluctuationPct: number;
  /** 成交溢价比例，成交价 = 当前价 × (1 + random(0,1) × pct) */
  dealPremiumPct: number;
}

const CONFIG_GROUP = 'nft';
const CONFIG_KEY = 'market';

const DEFAULT_RULES: NftMarketRules = {
  enabled: true,
  minPrice: 1,
  maxPrice: 99999,
  requireKyc: true,
  dailyFluctuationPct: 0.05,
  dealPremiumPct: 0.1,
};

@Injectable()
export class NftConfigService implements OnModuleInit {
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

  async getMarketRules(): Promise<NftMarketRules> {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) return { ...DEFAULT_RULES };
    return { ...DEFAULT_RULES, ...(row.value as Partial<NftMarketRules>) };
  }

  async saveMarketRules(rules: NftMarketRules): Promise<NftMarketRules> {
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
    return this.getMarketRules();
  }
}
