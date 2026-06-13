import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';

export interface WithdrawRules {
  min: number;
  max: number;
  fee: number;
  feeRate: number;
  methods: Array<'bank' | 'wechat' | 'alipay'>;
  requireKyc: boolean;
}

const CONFIG_GROUP = 'withdraw';
const CONFIG_KEY = 'rules';

const DEFAULT_RULES: WithdrawRules = {
  min: 1,
  max: 5000,
  fee: 0,
  feeRate: 0,
  methods: ['bank', 'wechat', 'alipay'],
  requireKyc: true,
};

@Injectable()
export class WithdrawConfigService implements OnModuleInit {
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

  async getRules(): Promise<WithdrawRules> {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) return { ...DEFAULT_RULES };
    return { ...DEFAULT_RULES, ...(row.value as Partial<WithdrawRules>) };
  }
}
