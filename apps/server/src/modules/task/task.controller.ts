import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { TaskService } from './task.service';

@ApiTags('Task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: '任务列表' })
  list(@CurrentUser('sub') userId: string) {
    return this.taskService.list(userId);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: '领取任务奖励' })
  claim(@CurrentUser('sub') userId: string, @Param('id') taskId: string) {
    return this.taskService.claim(userId, taskId);
  }
}
