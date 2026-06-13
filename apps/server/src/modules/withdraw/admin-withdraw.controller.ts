import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminWithdrawAuditDto, AdminWithdrawListQueryDto } from './dto';
import { WithdrawService } from './withdraw.service';

/** 后台提现审核（M2 暂不做 Admin 鉴权，后续接入 RBAC） */
@ApiTags('Admin-Withdraw')
@Controller('admin/withdraw')
export class AdminWithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Get()
  @ApiOperation({ summary: '提现申请列表（后台）' })
  list(@Query() query: AdminWithdrawListQueryDto) {
    return this.withdrawService.adminList(query);
  }

  @Post(':id/audit')
  @ApiOperation({ summary: '提现审核（通过打款/驳回）' })
  audit(@Param('id') id: string, @Body() dto: AdminWithdrawAuditDto) {
    return this.withdrawService.adminAudit(id, dto);
  }
}
