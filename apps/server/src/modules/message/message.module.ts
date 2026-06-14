import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { UserMessageEntity } from '../../database/entities/user-message.entity';
import { AdminNotificationController } from './admin-notification.controller';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserMessageEntity, UserEntity])],
  controllers: [MessageController, AdminNotificationController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
