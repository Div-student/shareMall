import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CampaignEntity } from '../../database/entities/campaign.entity';
import { AdminCampaignSaveDto, AdminListQueryDto } from './dto';

@Injectable()
export class CampaignService implements OnModuleInit {
  constructor(@InjectRepository(CampaignEntity) private readonly campaigns: Repository<CampaignEntity>) {}

  async onModuleInit() {
    const count = await this.campaigns.count();
    if (count === 0) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      await this.campaigns.save(
        this.campaigns.create({
          title: '春季好物节',
          subtitle: '精选商品限时优惠',
          type: 'promotion',
          status: 'active',
          content: '活动期间下单享更多贡献金回馈。',
          startAt: now,
          endAt: end,
        }),
      );
    }
  }

  async adminList(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [list, total] = await this.campaigns.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list: list.map((item) => this.toVo(item)), total, page, pageSize };
  }

  async adminCreate(dto: AdminCampaignSaveDto) {
    const saved = await this.campaigns.save(this.campaigns.create(this.fromDto(dto)));
    return this.toVo(saved);
  }

  async adminUpdate(id: string, dto: AdminCampaignSaveDto) {
    const row = await this.campaigns.findOne({ where: { id } });
    if (!row) throw new NotFoundException('活动不存在');
    Object.assign(row, this.fromDto(dto));
    return this.toVo(await this.campaigns.save(row));
  }

  async adminSetStatus(id: string, status: CampaignEntity['status']) {
    const row = await this.campaigns.findOne({ where: { id } });
    if (!row) throw new NotFoundException('活动不存在');
    row.status = status;
    await this.campaigns.save(row);
    return { success: true };
  }

  async listActive() {
    const now = new Date();
    const list = await this.campaigns.find({
      where: { status: 'active' },
      order: { id: 'DESC' },
    });
    return {
      list: list
        .filter((item) => this.isActive(item, now))
        .map((item) => this.toVo(item)),
    };
  }

  async detail(id: string) {
    const row = await this.campaigns.findOne({ where: { id } });
    if (!row) throw new NotFoundException('活动不存在');
    await this.campaigns.increment({ id }, 'participantCount', 1);
    return this.toVo(row);
  }

  private isActive(item: CampaignEntity, now: Date) {
    if (item.startAt && now < item.startAt) return false;
    if (item.endAt && now > item.endAt) return false;
    return true;
  }

  private fromDto(dto: AdminCampaignSaveDto) {
    return {
      title: dto.title,
      subtitle: dto.subtitle,
      banner: dto.banner,
      content: dto.content,
      type: dto.type ?? 'general',
      rule: dto.rule,
      status: dto.status ?? 'draft',
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    };
  }

  private toVo(item: CampaignEntity) {
    return {
      id: Number(item.id),
      title: item.title,
      subtitle: item.subtitle ?? '',
      banner: item.banner ?? '',
      content: item.content ?? '',
      type: item.type,
      rule: item.rule ?? null,
      status: item.status,
      participantCount: item.participantCount,
      startAt: item.startAt ?? null,
      endAt: item.endAt ?? null,
      createdAt: item.createdAt,
    };
  }
}
