import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../../database/entities/admin-user.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { AdminAccountCreateDto, AdminAccountUpdateDto } from './dto';
import { OperationLogService } from './operation-log.service';

@Injectable()
export class AdminAccountService {
  constructor(
    private readonly operationLog: OperationLogService,
    @InjectRepository(AdminUserEntity) private readonly admins: Repository<AdminUserEntity>,
    @InjectRepository(RoleEntity) private readonly roles: Repository<RoleEntity>,
  ) {}

  async list() {
    const [rows, roleRows] = await Promise.all([
      this.admins.find({ order: { id: 'ASC' } }),
      this.roles.find(),
    ]);
    const roleMap = new Map(roleRows.map((role) => [role.id, role.name]));

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        username: row.username,
        roleId: row.roleId ? Number(row.roleId) : null,
        roleName: row.roleId ? (roleMap.get(row.roleId) ?? '') : '',
        status: row.status,
        createdAt: row.createdAt,
      })),
    };
  }

  async create(dto: AdminAccountCreateDto, adminId: string, ip?: string) {
    const exists = await this.admins.findOne({ where: { username: dto.username } });
    if (exists) throw new BadRequestException('账号已存在');
    const role = await this.roles.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('角色不存在');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const saved = await this.admins.save(
      this.admins.create({
        username: dto.username,
        passwordHash,
        roleId: dto.roleId,
        status: 'enabled',
      }),
    );

    await this.operationLog.write({
      adminId,
      module: 'account',
      action: 'create',
      detail: { accountId: saved.id, username: saved.username },
      ip,
    });

    return { id: Number(saved.id) };
  }

  async update(id: string, dto: AdminAccountUpdateDto, adminId: string, ip?: string) {
    const account = await this.admins.findOne({ where: { id } });
    if (!account) throw new NotFoundException('账号不存在');

    if (dto.roleId) {
      const role = await this.roles.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('角色不存在');
      account.roleId = dto.roleId;
    }
    if (dto.status) account.status = dto.status;
    if (dto.password) account.passwordHash = await bcrypt.hash(dto.password, 10);

    await this.admins.save(account);
    await this.operationLog.write({
      adminId,
      module: 'account',
      action: 'update',
      detail: { accountId: id, username: account.username, status: account.status },
      ip,
    });
    return { success: true };
  }
}
