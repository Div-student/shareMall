import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { UserMessageEntity } from '../../database/entities/user-message.entity';
import { BroadcastNotificationDto, MessageListQueryDto } from './dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(UserMessageEntity) private readonly messages: Repository<UserMessageEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async send(input: {
    userId: string;
    type: UserMessageEntity['type'];
    title: string;
    content: string;
    link?: string;
  }) {
    const row = await this.messages.save(
      this.messages.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        content: input.content,
        link: input.link,
        isRead: false,
      }),
    );
    return { id: Number(row.id) };
  }

  async list(userId: string, query: MessageListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.messages
      .createQueryBuilder('m')
      .where('m.user_id = :userId', { userId })
      .orderBy('m.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.type && query.type !== 'all') {
      qb.andWhere('m.type = :type', { type: query.type });
    }

    const [rows, total] = await qb.getManyAndCount();
    return {
      list: rows.map((m) => this.toVo(m)),
      total,
    };
  }

  async unreadCount(userId: string) {
    const count = await this.messages.count({ where: { userId, isRead: false } });
    return { count };
  }

  async detail(userId: string, id: string) {
    const row = await this.messages.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('消息不存在');
    if (!row.isRead) {
      row.isRead = true;
      await this.messages.save(row);
    }
    return this.toVo(row);
  }

  async markRead(userId: string, id: string) {
    const row = await this.messages.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('消息不存在');
    row.isRead = true;
    await this.messages.save(row);
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.messages.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async adminBroadcast(dto: BroadcastNotificationDto) {
    let userIds: string[] = [];
    if (dto.target === 'all') {
      const users = await this.users.find({ select: ['id'] });
      userIds = users.map((u) => u.id);
    } else {
      if (!dto.phones?.length) throw new BadRequestException('请指定手机号');
      const users = await this.users.find({ where: { phone: In(dto.phones) } });
      userIds = users.map((u) => u.id);
      if (!userIds.length) throw new NotFoundException('未找到目标用户');
    }

    const type = dto.type ?? 'system';
    for (const userId of userIds) {
      await this.send({ userId, type, title: dto.title, content: dto.content });
    }
    return { success: true, count: userIds.length };
  }

  async adminList(query: MessageListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.messages.createQueryBuilder('m').orderBy('m.created_at', 'DESC');
    if (query.type && query.type !== 'all') {
      qb.andWhere('m.type = :type', { type: query.type });
    }
    const [rows, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: rows.map((m) => this.toVo(m)), total, page, pageSize };
  }

  private toVo(row: UserMessageEntity) {
    return {
      id: Number(row.id),
      type: row.type,
      title: row.title,
      content: row.content,
      link: row.link,
      isRead: row.isRead,
      createdAt: row.createdAt,
    };
  }
}
