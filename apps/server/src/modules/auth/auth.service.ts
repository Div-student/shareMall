import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../database/entities/user.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { SmsService } from '../../common/sms/sms.service';
import { LoginDto, LoginSmsDto, RegisterDto, SendSmsDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  async sendSms(dto: SendSmsDto) {
    if (dto.scene === 'register') {
      const exists = await this.users.findOne({ where: { phone: dto.phone } });
      if (exists) throw new BadRequestException('该手机号已注册');
    }
    await this.sms.send(dto.phone, dto.scene);
    return { sent: true };
  }

  async register(dto: RegisterDto, ip?: string) {
    if (!this.sms.verify(dto.phone, 'register', dto.smsCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    const exists = await this.users.findOne({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('该手机号已注册');

    const inviteRequired = this.config.get<string>('INVITE_REQUIRED') === 'true';
    let inviter: UserEntity | null = null;
    if (dto.inviteCode) {
      inviter = await this.users.findOne({ where: { inviteCode: dto.inviteCode } });
      if (!inviter) throw new BadRequestException('邀请码无效');
    } else if (inviteRequired) {
      throw new BadRequestException('请填写邀请码');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.dataSource.transaction(async (manager) => {
      const created = manager.create(UserEntity, {
        phone: dto.phone,
        passwordHash,
        inviteCode: await this.generateUniqueInviteCode(manager.getRepository(UserEntity)),
        inviterId: inviter?.id,
        registerIp: ip,
      });
      const saved = await manager.save(created);

      await manager.save(manager.create(FundAccountEntity, { userId: saved.id }));

      if (inviter) {
        await manager.save(
          manager.create(InviteRelationEntity, {
            inviterId: inviter.id,
            inviteeId: saved.id,
            inviteCode: dto.inviteCode!,
          }),
        );
      }
      return saved;
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('账号或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('账号或密码错误');
    this.ensureNotFrozen(user);
    await this.users.update(user.id, { lastLoginAt: new Date() });
    return this.issueToken(user);
  }

  async loginSms(dto: LoginSmsDto) {
    if (!this.sms.verify(dto.phone, 'login', dto.smsCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    const user = await this.users.findOne({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('该手机号未注册');
    this.ensureNotFrozen(user);
    await this.users.update(user.id, { lastLoginAt: new Date() });
    return this.issueToken(user);
  }

  private ensureNotFrozen(user: UserEntity) {
    if (user.status !== 'normal') {
      throw new UnauthorizedException('账号已被冻结，请联系客服');
    }
  }

  private async issueToken(user: UserEntity) {
    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone });
    return {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        inviteCode: user.inviteCode,
        kycStatus: user.kycStatus,
      },
    };
  }

  private async generateUniqueInviteCode(repo: Repository<UserEntity>): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 10; i += 1) {
      const code = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      const exists = await repo.findOne({ where: { inviteCode: code } });
      if (!exists) return code;
    }
    throw new BadRequestException('邀请码生成失败，请重试');
  }
}
