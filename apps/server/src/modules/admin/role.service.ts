import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../database/entities/role.entity';
import { ADMIN_PERMISSION_OPTIONS } from './admin.constants';
import { AdminRoleSaveDto } from './dto';
import { OperationLogService } from './operation-log.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly operationLog: OperationLogService,
    @InjectRepository(RoleEntity) private readonly roles: Repository<RoleEntity>,
  ) {}

  list() {
    return this.roles.find({ order: { id: 'ASC' } }).then((rows) => ({
      list: rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        permissions: row.permissions ?? [],
        dataScope: row.dataScope,
        createdAt: row.createdAt,
      })),
      permissionOptions: ADMIN_PERMISSION_OPTIONS,
    }));
  }

  async create(dto: AdminRoleSaveDto, adminId: string, ip?: string) {
    this.validatePermissions(dto.permissions);
    const saved = await this.roles.save(
      this.roles.create({
        name: dto.name,
        permissions: dto.permissions,
        dataScope: dto.dataScope,
      }),
    );
    await this.operationLog.write({
      adminId,
      module: 'role',
      action: 'create',
      detail: { roleId: saved.id, name: saved.name },
      ip,
    });
    return { id: Number(saved.id) };
  }

  async update(id: string, dto: AdminRoleSaveDto, adminId: string, ip?: string) {
    const role = await this.roles.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    this.validatePermissions(dto.permissions);
    role.name = dto.name;
    role.permissions = dto.permissions;
    role.dataScope = dto.dataScope;
    await this.roles.save(role);
    await this.operationLog.write({
      adminId,
      module: 'role',
      action: 'update',
      detail: { roleId: id, name: role.name },
      ip,
    });
    return { success: true };
  }

  private validatePermissions(permissions: string[]) {
    const allowed = new Set<string>([
      ...ADMIN_PERMISSION_OPTIONS.map((item) => item.key),
      '*',
    ]);
    if (!permissions.length) {
      throw new BadRequestException('请至少选择一个权限');
    }
    for (const permission of permissions) {
      if (!allowed.has(permission)) {
        throw new BadRequestException(`无效权限：${permission}`);
      }
    }
  }
}
