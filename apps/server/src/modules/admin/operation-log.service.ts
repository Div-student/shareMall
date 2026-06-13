import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLogEntity } from '../../database/entities/operation-log.entity';

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLogEntity)
    private readonly logs: Repository<OperationLogEntity>,
  ) {}

  async write(input: {
    adminId: string;
    module: string;
    action: string;
    detail?: Record<string, unknown>;
    ip?: string;
  }) {
    await this.logs.save(
      this.logs.create({
        adminId: input.adminId,
        module: input.module,
        action: input.action,
        detail: input.detail,
        ip: input.ip,
      }),
    );
  }

  async list(query: { module?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.logs.createQueryBuilder('log').orderBy('log.id', 'DESC');

    if (query.module) {
      qb.andWhere('log.module = :module', { module: query.module });
    }

    const [rows, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        adminId: Number(row.adminId),
        module: row.module,
        action: row.action,
        detail: row.detail,
        ip: row.ip,
        createdAt: row.createdAt,
      })),
      total,
    };
  }
}
