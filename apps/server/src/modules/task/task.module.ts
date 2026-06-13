import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { TaskRecordEntity } from '../../database/entities/task-record.entity';
import { TaskEntity } from '../../database/entities/task.entity';
import { FundModule } from '../fund/fund.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    FundModule,
    TypeOrmModule.forFeature([TaskEntity, TaskRecordEntity, InviteRelationEntity, OrderEntity]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
