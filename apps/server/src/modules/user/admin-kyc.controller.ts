import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminKycAuditDto, AdminKycListQueryDto } from './dto';
import { KycService } from './kyc.service';

/** 后台实名审核（M2 暂不做 Admin 鉴权，后续接入 RBAC） */
@ApiTags('Admin-Kyc')
@Controller('admin/kyc')
export class AdminKycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @ApiOperation({ summary: '实名认证列表（后台）' })
  list(@Query() query: AdminKycListQueryDto) {
    return this.kycService.adminList(query);
  }

  @Post(':id/audit')
  @ApiOperation({ summary: '实名审核' })
  audit(@Param('id') id: string, @Body() dto: AdminKycAuditDto) {
    return this.kycService.adminAudit(id, dto);
  }
}
