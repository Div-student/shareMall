import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UserKycEntity } from '../../database/entities/user-kyc.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminKycAuditDto, AdminKycListQueryDto, SubmitKycDto } from './dto';

const ID_CARD_RE = /^\d{17}[\dXx]$/;
const REAL_NAME_RE = /^[\u4e00-\u9fa5·]{2,20}$/;

function maskIdCard(idCard: string) {
  if (idCard.length < 8) return '****';
  return `${idCard.slice(0, 4)}**********${idCard.slice(-4)}`;
}

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(UserKycEntity) private readonly kycRepo: Repository<UserKycEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getStatus(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const kyc = await this.kycRepo.findOne({ where: { userId } });
    return {
      status: user.kycStatus,
      realName: kyc?.realName ?? '',
      idCardNo: kyc ? maskIdCard(kyc.idCardNo) : '',
      rejectReason: kyc?.rejectReason ?? '',
      submittedAt: kyc?.createdAt ?? null,
      auditedAt: kyc?.auditedAt ?? null,
    };
  }

  async submit(userId: string, dto: SubmitKycDto) {
    const realName = dto.realName.trim();
    const idCardNo = dto.idCardNo.trim().toUpperCase();

    if (!REAL_NAME_RE.test(realName)) {
      throw new BadRequestException('请输入真实姓名（2-20 个汉字）');
    }
    if (!ID_CARD_RE.test(idCardNo)) {
      throw new BadRequestException('请输入正确的 18 位身份证号');
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.kycStatus === 'passed') {
      throw new BadRequestException('您已完成实名认证');
    }
    if (user.kycStatus === 'pending') {
      throw new BadRequestException('实名认证审核中，请耐心等待');
    }

    const existing = await this.kycRepo.findOne({ where: { userId } });
    if (existing) {
      existing.realName = realName;
      existing.idCardNo = idCardNo;
      existing.status = 'pending';
      existing.rejectReason = undefined;
      existing.auditedBy = undefined;
      existing.auditedAt = undefined;
      await this.kycRepo.save(existing);
    } else {
      await this.kycRepo.save(
        this.kycRepo.create({
          userId,
          realName,
          idCardNo,
          status: 'pending',
        }),
      );
    }

    user.kycStatus = 'pending';
    await this.users.save(user);

    return { status: 'pending' as const };
  }

  async adminList(query: AdminKycListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.kycRepo
      .createQueryBuilder('k')
      .orderBy('k.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.status && query.status !== 'all') {
      qb.andWhere('k.status = :status', { status: query.status });
    }

    const [rows, total] = await qb.getManyAndCount();
    const userIds = rows.map((r) => r.userId);
    const userMap = new Map<string, UserEntity>();
    if (userIds.length) {
      const users = await this.users.find({ where: { id: In(userIds) } });
      users.forEach((u) => userMap.set(u.id, u));
    }

    return {
      list: rows.map((row) => {
        const user = userMap.get(row.userId);
        return {
          id: Number(row.id),
          userId: Number(row.userId),
          phone: user?.phone ?? '',
          realName: row.realName,
          idCardNo: maskIdCard(row.idCardNo),
          status: row.status,
          rejectReason: row.rejectReason ?? '',
          createdAt: row.createdAt,
          auditedAt: row.auditedAt ?? null,
        };
      }),
      total,
    };
  }

  async adminAudit(id: string, dto: AdminKycAuditDto) {
    const kyc = await this.kycRepo.findOne({ where: { id } });
    if (!kyc) throw new NotFoundException('认证记录不存在');
    if (kyc.status !== 'pending') {
      throw new BadRequestException('该记录已审核，请勿重复操作');
    }

    const user = await this.users.findOne({ where: { id: kyc.userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const passed = dto.action === 'pass';
    if (!passed && !dto.reason?.trim()) {
      throw new BadRequestException('驳回时请填写原因');
    }

    await this.dataSource.transaction(async (manager) => {
      kyc.status = passed ? 'passed' : 'rejected';
      kyc.rejectReason = passed ? undefined : dto.reason?.trim();
      kyc.auditedAt = new Date();
      await manager.save(kyc);

      user.kycStatus = passed ? 'passed' : 'rejected';
      await manager.save(user);
    });

    return { success: true, status: kyc.status };
  }
}
