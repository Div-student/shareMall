import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OperationLogQueryDto } from './dto';
import { OperationLogService } from './operation-log.service';

@ApiTags('Admin-Log')
@ApiBearerAuth()
@Controller('admin/logs')
export class OperationLogController {
  constructor(private readonly operationLog: OperationLogService) {}

  @Get()
  @ApiOperation({ summary: '操作日志列表' })
  list(@Query() query: OperationLogQueryDto) {
    return this.operationLog.list(query);
  }
}
