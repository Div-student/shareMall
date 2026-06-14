import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsConfigService } from '../../common/sms/sms-config.service';

interface CodeEntry {
  code: string;
  expireAt: number;
}

/**
 * 短信验证码服务（开发环境使用 mock：验证码固定 8888 并打印日志，
 * 验证码暂存内存。生产环境应替换为真实短信服务商 + Redis 存储 + 频控）。
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly store = new Map<string, CodeEntry>();
  private readonly ttlMs = 5 * 60 * 1000;

  constructor(
    private readonly config: ConfigService,
    private readonly smsConfig: SmsConfigService,
  ) {}

  private key(phone: string, scene: string) {
    return `${scene}:${phone}`;
  }

  async send(phone: string, scene: string): Promise<void> {
    const runtime = this.smsConfig.getRuntimeConfig();
    const provider = runtime.provider ?? this.config.get<string>('SMS_PROVIDER') ?? 'mock';
    const code = provider === 'mock' ? (runtime.devCode || '8888') : this.randomCode();
    this.store.set(this.key(phone, scene), { code, expireAt: Date.now() + this.ttlMs });

    if (provider === 'mock') {
      this.logger.log(`[MOCK SMS] phone=${phone} scene=${scene} code=${code}`);
      return;
    }
    // TODO: 接入阿里云/腾讯云短信发送 code
    this.logger.warn(`SMS provider ${provider} 未实现，请补充发送逻辑`);
  }

  verify(phone: string, scene: string, code: string): boolean {
    const entry = this.store.get(this.key(phone, scene));
    if (!entry) return false;
    if (Date.now() > entry.expireAt) {
      this.store.delete(this.key(phone, scene));
      return false;
    }
    const ok = entry.code === code;
    if (ok) this.store.delete(this.key(phone, scene));
    return ok;
  }

  private randomCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
