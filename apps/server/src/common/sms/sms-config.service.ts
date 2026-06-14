import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';

const CONFIG_GROUP = 'sms';
const CONFIG_KEY = 'provider';

export interface SmsConfigValue {
  provider: 'mock' | 'aliyun' | 'tencent';
  signName: string;
  templateCode: string;
  accessKey: string;
  accessSecret: string;
  devCode: string;
}

const DEFAULT_CONFIG: SmsConfigValue = {
  provider: 'mock',
  signName: '',
  templateCode: '',
  accessKey: '',
  accessSecret: '',
  devCode: '8888',
};

@Injectable()
export class SmsConfigService implements OnModuleInit {
  private cache: SmsConfigValue = { ...DEFAULT_CONFIG };

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
    this.cache = await this.loadConfig();
  }

  getRuntimeConfig() {
    return this.cache;
  }

  async getConfigForAdmin() {
    const config = await this.loadConfig();
    return {
      ...config,
      accessSecret: config.accessSecret ? '******' : '',
    };
  }

  async saveConfig(dto: Partial<SmsConfigValue>) {
    const current = await this.loadConfig();
    const next: SmsConfigValue = {
      provider: dto.provider ?? current.provider,
      signName: dto.signName ?? current.signName,
      templateCode: dto.templateCode ?? current.templateCode,
      accessKey: dto.accessKey ?? current.accessKey,
      accessSecret:
        dto.accessSecret && dto.accessSecret !== '******' ? dto.accessSecret : current.accessSecret,
      devCode: dto.devCode ?? current.devCode,
    };
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    if (row) {
      row.value = next as unknown as Record<string, unknown>;
      await this.configs.save(row);
    } else {
      await this.configs.save(
        this.configs.create({
          group: CONFIG_GROUP,
          key: CONFIG_KEY,
          value: next as unknown as Record<string, unknown>,
        }),
      );
    }
    this.cache = next;
    return this.getConfigForAdmin();
  }

  private async loadConfig() {
    const row = await this.configs.findOne({ where: { group: CONFIG_GROUP, key: CONFIG_KEY } });
    return { ...DEFAULT_CONFIG, ...(row?.value as Partial<SmsConfigValue> | undefined) };
  }
}
