import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { MessageListQueryDto } from './dto';
import { MessageService } from './message.service';

@ApiTags('Message')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: '消息列表' })
  list(@CurrentUser('sub') userId: string, @Query() query: MessageListQueryDto) {
    return this.messageService.list(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读消息数' })
  unreadCount(@CurrentUser('sub') userId: string) {
    return this.messageService.unreadCount(userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  markAllRead(@CurrentUser('sub') userId: string) {
    return this.messageService.markAllRead(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '消息详情（自动标记已读）' })
  detail(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.messageService.detail(userId, id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记已读' })
  markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.messageService.markRead(userId, id);
  }
}
