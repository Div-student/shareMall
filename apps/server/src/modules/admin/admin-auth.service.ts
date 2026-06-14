import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../../database/entities/admin-user.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { ALL_ADMIN_PERMISSIONS } from './admin.constants';
import { AdminLoginDto } from './dto';
import { OperationLogService } from './operation-log.service';

const DEFAULT_ROLES: Array<Pick<RoleEntity, 'name' | 'permissions' | 'dataScope'>> = [
  { name: '超级管理员', permissions: ['*'], dataScope: 'all' },
  {
    name: '运营',
    permissions: [
      'dashboard:view',
      'product:manage',
      'order:manage',
      'aftersale:manage',
      'review:manage',
      'coupon:manage',
      'campaign:manage',
      'dict:manage',
      'service:config',
      'order-feed:config',
      'notification:manage',
      'checkin:monitor',
      'user:view',
      'sms:config',
      'kyc:audit',
      'fund:config',
      'withdraw:audit',
      'log:view',
    ],
    dataScope: 'all',
  },
  {
    name: '财务',
    permissions: ['dashboard:view', 'finance:view', 'fund:config', 'withdraw:audit', 'log:view'],
    dataScope: 'all',
  },
];

@Injectable()
export class AdminAuthService implements OnModuleInit {
  constructor(
    private readonly jwt: JwtService,
    private readonly operationLog: OperationLogService,
    @InjectRepository(AdminUserEntity) private readonly admins: Repository<AdminUserEntity>,
    @InjectRepository(RoleEntity) private readonly roles: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    try {
      const roleCount = await this.roles.count();
      if (roleCount === 0) {
        await this.roles.save(DEFAULT_ROLES.map((item) => this.roles.create(item)));
      }

      const existingAdmin = await this.admins.findOne({ where: { username: 'admin' } });
      if (!existingAdmin) {
        const superRole = await this.roles.findOne({ where: { name: '超级管理员' } });
        const passwordHash = await bcrypt.hash('admin123', 10);
        await this.admins.save(
          this.admins.create({
            username: 'admin',
            passwordHash,
            roleId: superRole?.id,
            status: 'enabled',
          }),
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[AdminAuthService] 初始化后台账号失败，请确认已执行 migrations/003_admin_rbac.sql',
        error,
      );
    }
  }

  async login(dto: AdminLoginDto, ip?: string) {
    const admin = await this.admins.findOne({ where: { username: dto.username } });
    if (!admin || admin.status !== 'enabled') {
      throw new UnauthorizedException('账号或密码错误');
    }

    const matched = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const role = admin.roleId
      ? await this.roles.findOne({ where: { id: admin.roleId } })
      : null;
    const permissions = role?.permissions ?? [];

    const token = await this.jwt.signAsync({
      sub: admin.id,
      username: admin.username,
      roleId: admin.roleId,
      permissions,
      type: 'admin',
    });

    await this.operationLog.write({
      adminId: admin.id,
      module: 'auth',
      action: 'login',
      detail: { username: admin.username },
      ip,
    });

    return {
      token,
      adminInfo: {
        id: Number(admin.id),
        username: admin.username,
        roleId: admin.roleId ? Number(admin.roleId) : null,
        roleName: role?.name ?? '',
        permissions,
      },
      permissionOptions: ALL_ADMIN_PERMISSIONS,
    };
  }

  async profile(adminId: string) {
    const admin = await this.admins.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('管理员不存在');
    const role = admin.roleId
      ? await this.roles.findOne({ where: { id: admin.roleId } })
      : null;
    return {
      id: Number(admin.id),
      username: admin.username,
      roleId: admin.roleId ? Number(admin.roleId) : null,
      roleName: role?.name ?? '',
      permissions: role?.permissions ?? [],
    };
  }
}
