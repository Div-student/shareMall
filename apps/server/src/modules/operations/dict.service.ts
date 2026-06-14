import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictEntity } from '../../database/entities/dict.entity';
import { AdminDictListQueryDto, AdminDictSaveDto } from './dto';

const DEFAULT_DICTS: Array<Pick<DictEntity, 'group' | 'code' | 'label' | 'sort'>> = [
  { group: 'order_status', code: 'unpaid', label: '待支付', sort: 1 },
  { group: 'order_status', code: 'paid', label: '待发货', sort: 2 },
  { group: 'order_status', code: 'shipped', label: '待收货', sort: 3 },
  { group: 'order_status', code: 'completed', label: '已完成', sort: 4 },
  { group: 'aftersale_reason', code: 'quality', label: '质量问题', sort: 1 },
  { group: 'aftersale_reason', code: 'wrong_item', label: '发错货', sort: 2 },
  { group: 'aftersale_reason', code: 'not_want', label: '不想要了', sort: 3 },
  { group: 'coupon_type', code: 'fixed', label: '满减券', sort: 1 },
  { group: 'coupon_type', code: 'discount', label: '折扣券', sort: 2 },
];

@Injectable()
export class DictService implements OnModuleInit {
  constructor(@InjectRepository(DictEntity) private readonly dicts: Repository<DictEntity>) {}

  async onModuleInit() {
    const count = await this.dicts.count();
    if (count === 0) {
      await this.dicts.save(DEFAULT_DICTS.map((item) => this.dicts.create(item)));
    }
  }

  async adminList(query: AdminDictListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.dicts.createQueryBuilder('d').orderBy('d.group', 'ASC').addOrderBy('d.sort', 'ASC');
    if (query.group) qb.andWhere('d.group = :group', { group: query.group });
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: list.map((item) => this.toVo(item)), total, page, pageSize };
  }

  async adminCreate(dto: AdminDictSaveDto) {
    const exists = await this.dicts.findOne({ where: { group: dto.group, code: dto.code } });
    if (exists) throw new BadRequestException('同分组下编码已存在');
    const saved = await this.dicts.save(this.dicts.create(this.fromDto(dto)));
    return this.toVo(saved);
  }

  async adminUpdate(id: string, dto: AdminDictSaveDto) {
    const row = await this.dicts.findOne({ where: { id } });
    if (!row) throw new NotFoundException('字典项不存在');
    const conflict = await this.dicts.findOne({ where: { group: dto.group, code: dto.code } });
    if (conflict && conflict.id !== id) throw new BadRequestException('同分组下编码已存在');
    Object.assign(row, this.fromDto(dto));
    return this.toVo(await this.dicts.save(row));
  }

  async adminDelete(id: string) {
    const row = await this.dicts.findOne({ where: { id } });
    if (!row) throw new NotFoundException('字典项不存在');
    await this.dicts.remove(row);
    return { success: true };
  }

  async listByGroup(group: string) {
    const list = await this.dicts.find({
      where: { group, status: 'enabled' },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return { list: list.map((item) => this.toVo(item)) };
  }

  async listGroups() {
    const rows = await this.dicts
      .createQueryBuilder('d')
      .select('d.group', 'group')
      .addSelect('COUNT(*)', 'count')
      .groupBy('d.group')
      .orderBy('d.group', 'ASC')
      .getRawMany<{ group: string; count: string }>();
    return { list: rows.map((item) => ({ group: item.group, count: Number(item.count) })) };
  }

  private fromDto(dto: AdminDictSaveDto) {
    return {
      group: dto.group,
      code: dto.code,
      label: dto.label,
      sort: dto.sort ?? 0,
      status: dto.status ?? 'enabled',
      remark: dto.remark,
    };
  }

  private toVo(item: DictEntity) {
    return {
      id: Number(item.id),
      group: item.group,
      code: item.code,
      label: item.label,
      sort: item.sort,
      status: item.status,
      remark: item.remark ?? '',
      createdAt: item.createdAt,
    };
  }
}
