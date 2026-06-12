import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CHECKIN_DAYS, FUND_TIERS } from '@sharemall/shared';
import { ConfigEntity } from '../../database/entities/config.entity';

export interface FundRules {
  defaultRatio: number;
  tiers: number[];
  checkinDays: number;
  missRule: 'void' | 'makeup';
  deductLimitRate: number;
  marketFeeRate: number;
}

const CONFIG_GROUP = 'fund';
const CONFIG_KEY = 'rules';

const DEFAULT_RULES: FundRules = {
  defaultRatio: 0.05,
  tiers: [...FUND_TIERS],
  checkinDays: DEFAULT_CHECKIN_DAYS,
  missRule: 'void',
  deductLimitRate: 0.5,
  marketFeeRate: 0.05,
};

@Injectable()
export class FundConfigService implements OnModuleInit {
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

  async getRules(): Promise<FundRules> {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) return { ...DEFAULT_RULES };
    return { ...DEFAULT_RULES, ...(row.value as Partial<FundRules>) };
  }

  async saveRules(rules: FundRules): Promise<FundRules> {
    let row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) {
      row = this.configs.create({ group: CONFIG_GROUP, key: CONFIG_KEY, value: rules as unknown as Record<string, unknown> });
    } else {
      row.value = rules as unknown as Record<string, unknown>;
    }
    await this.configs.save(row);
    return this.getRules();
  }
}
