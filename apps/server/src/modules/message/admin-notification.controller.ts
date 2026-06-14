import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { BroadcastNotificationDto, MessageListQueryDto } from './dto';
import { MessageService } from './message.service';

@ApiTags('Admin Notification')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: '站内通知记录' })
  list(@Query() query: MessageListQueryDto) {
    return this.messageService.adminList(query);
  }

  @Post('broadcast')
  @ApiOperation({ summary: '广播站内通知' })
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.messageService.adminBroadcast(dto);
  }
}
