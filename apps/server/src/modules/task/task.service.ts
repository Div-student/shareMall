import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { TaskRecordEntity } from '../../database/entities/task-record.entity';
import { TaskEntity } from '../../database/entities/task.entity';
import { FundService } from '../fund/fund.service';

const DEFAULT_TASKS: Array<Pick<TaskEntity, 'name' | 'type' | 'rewardType' | 'rewardValue' | 'rule'>> = [
  { name: '每日签到', type: 'sign', rewardType: 'fund', rewardValue: 1, rule: { daily: true } },
  { name: '邀请好友', type: 'invite', rewardType: 'fund', rewardValue: 5, rule: { target: 1 } },
  { name: '首单奖励', type: 'first_order', rewardType: 'fund', rewardValue: 3, rule: {} },
  { name: '浏览商品', type: 'browse', rewardType: 'fund', rewardValue: 0.5, rule: { daily: true } },
  { name: '分享好友', type: 'share', rewardType: 'fund', rewardValue: 1, rule: { daily: true } },
];

const TYPE_DESC: Record<TaskEntity['type'], string> = {
  sign: '每日签到领取待兑现贡献金',
  invite: '邀请好友注册并完成注册',
  first_order: '完成首笔支付订单',
  browse: '浏览商品页面',
  share: '分享邀请链接给好友',
};

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundService: FundService,
    @InjectRepository(TaskEntity) private readonly tasks: Repository<TaskEntity>,
    @InjectRepository(TaskRecordEntity) private readonly taskRecords: Repository<TaskRecordEntity>,
    @InjectRepository(InviteRelationEntity) private readonly invites: Repository<InviteRelationEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.tasks.count();
    if (count === 0) {
      await this.tasks.save(DEFAULT_TASKS.map((item) => this.tasks.create(item)));
    }
  }

  async list(userId: string) {
    const [taskList, records, invitedCount, hasPaidOrder] = await Promise.all([
      this.tasks.find({ where: { status: 'enabled' }, order: { id: 'ASC' } }),
      this.taskRecords.find({ where: { userId } }),
      this.invites.count({ where: { inviterId: userId } }),
      this.orders.exist({
        where: {
          userId,
          status: In(['paid', 'shipped', 'received', 'completed']),
        },
      }),
    ]);

    const recordMap = new Map(records.map((r) => [r.taskId, r]));

    return {
      list: taskList.map((task) => {
        const record = recordMap.get(task.id);
        const status = this.resolveStatus(task, record, {
          invitedCount,
          hasPaidOrder,
        });

        return {
          id: Number(task.id),
          name: task.name,
          type: task.type,
          description: TYPE_DESC[task.type],
          rewardType: task.rewardType,
          rewardValue: task.rewardValue,
          status,
          claimedAt: record?.claimedAt ?? null,
        };
      }),
    };
  }

  async claim(userId: string, taskId: string) {
    const task = await this.tasks.findOne({ where: { id: taskId, status: 'enabled' } });
    if (!task) throw new NotFoundException('任务不存在或已下线');

    const [record, invitedCount, hasPaidOrder] = await Promise.all([
      this.taskRecords.findOne({ where: { userId, taskId: task.id } }),
      this.invites.count({ where: { inviterId: userId } }),
      this.orders.exist({
        where: {
          userId,
          status: In(['paid', 'shipped', 'received', 'completed']),
        },
      }),
    ]);

    const status = this.resolveStatus(task, record ?? undefined, { invitedCount, hasPaidOrder });
    if (status === 'claimed') throw new BadRequestException('奖励已领取');
    if (status !== 'completed') throw new BadRequestException('任务尚未完成');

    return this.dataSource.transaction(async (manager) => {
      const recordRepo = manager.getRepository(TaskRecordEntity);
      const existing = await recordRepo.findOne({ where: { userId, taskId: task.id } });

      if (existing?.status === 'claimed') {
        if (this.isDailyTask(task.type) && existing.claimedAt && this.isSameDay(existing.claimedAt)) {
          throw new BadRequestException('今日奖励已领取');
        }
        if (!this.isDailyTask(task.type)) {
          throw new BadRequestException('奖励已领取');
        }
      }

      await this.fundService.grantTaskReward(
        manager,
        userId,
        task.rewardValue,
        task.id,
        task.name,
        task.rewardType,
      );

      const now = new Date();
      if (existing) {
        existing.status = 'claimed';
        existing.claimedAt = now;
        await recordRepo.save(existing);
      } else {
        await recordRepo.save(
          recordRepo.create({
            userId,
            taskId: task.id,
            status: 'claimed',
            claimedAt: now,
          }),
        );
      }

      return {
        success: true,
        rewardType: task.rewardType,
        rewardValue: task.rewardValue,
      };
    });
  }

  private resolveStatus(
    task: TaskEntity,
    record: TaskRecordEntity | undefined,
    ctx: { invitedCount: number; hasPaidOrder: boolean },
  ): 'ongoing' | 'completed' | 'claimed' {
    if (this.isDailyTask(task.type)) {
      if (record?.claimedAt && this.isSameDay(record.claimedAt)) {
        return 'claimed';
      }
      return 'completed';
    }

    if (record?.status === 'claimed') return 'claimed';

    const completed = this.isTaskCompleted(task, ctx);
    return completed ? 'completed' : 'ongoing';
  }

  private isTaskCompleted(
    task: TaskEntity,
    ctx: { invitedCount: number; hasPaidOrder: boolean },
  ) {
    switch (task.type) {
      case 'invite': {
        const target = Number(task.rule?.target ?? 1);
        return ctx.invitedCount >= target;
      }
      case 'first_order':
        return ctx.hasPaidOrder;
      case 'sign':
      case 'browse':
      case 'share':
        return true;
      default:
        return false;
    }
  }

  private isDailyTask(type: TaskEntity['type']) {
    return type === 'sign' || type === 'browse' || type === 'share';
  }

  private isSameDay(date: Date) {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }
}
