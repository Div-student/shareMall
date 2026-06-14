import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';
import { ServiceConfigSaveDto } from './dto';

const CONFIG_GROUP = 'service';
const CONFIG_KEY = 'contact';

export interface ServiceConfigValue {
  phone: string;
  wechat: string;
  workTime: string;
  onlineUrl: string;
  faq: Array<{ question: string; answer: string; sort: number }>;
}

const DEFAULT_CONFIG: ServiceConfigValue = {
  phone: '400-000-0000',
  wechat: 'shareMall_service',
  workTime: '工作日 9:00-18:00',
  onlineUrl: '',
  faq: [
    { question: '贡献金如何获得？', answer: '确认收货后累计待兑现贡献金，达档位后可打卡兑现。', sort: 1 },
    { question: '提现金从哪里来？', answer: '数字藏品二级市场成交后，卖家所得进入提现金。', sort: 2 },
    { question: '优惠券如何使用？', answer: '下单时在确认订单页选择可用优惠券即可抵扣。', sort: 3 },
  ],
};

@Injectable()
export class ServiceConfigService implements OnModuleInit {
  constructor(@InjectRepository(ConfigEntity) private readonly configs: Repository<ConfigEntity>) {}

  async onModuleInit() {
    const existing = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!existing) {
      await this.configs.save(
        this.configs.create({
          group: CONFIG_GROUP,
          key: CONFIG_KEY,
          value: DEFAULT_CONFIG as unknown as Record<string, unknown>,
        }),
      );
    }
  }

  async getConfig() {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    return (row?.value ?? DEFAULT_CONFIG) as ServiceConfigValue;
  }

  async saveConfig(dto: ServiceConfigSaveDto) {
    const current = await this.getConfig();
    const next: ServiceConfigValue = {
      phone: dto.phone ?? current.phone,
      wechat: dto.wechat ?? current.wechat,
      workTime: dto.workTime ?? current.workTime,
      onlineUrl: dto.onlineUrl ?? current.onlineUrl,
      faq: dto.faq
        ? dto.faq.map((item, index) => ({
            question: item.question,
            answer: item.answer,
            sort: item.sort ?? index,
          }))
        : current.faq,
    };
    let row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (!row) {
      row = this.configs.create({ group: CONFIG_GROUP, key: CONFIG_KEY, value: next as unknown as Record<string, unknown> });
    } else {
      row.value = next as unknown as Record<string, unknown>;
    }
    await this.configs.save(row);
    return next;
  }
}
