import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AftersaleService } from './aftersale.service';
import { AdminAftersaleAuditDto, AftersaleListQueryDto } from './dto';

/** 后台售后管理（M2 暂不做 Admin 鉴权） */
@ApiTags('Admin-Aftersale')
@Controller('admin/aftersale')
export class AdminAftersaleController {
  constructor(private readonly aftersaleService: AftersaleService) {}

  @Get()
  @ApiOperation({ summary: '售后列表（后台）' })
  list(@Query() query: AftersaleListQueryDto) {
    return this.aftersaleService.adminList(query);
  }

  @Post(':id/audit')
  @ApiOperation({ summary: '售后审核' })
  audit(@Param('id') id: string, @Body() dto: AdminAftersaleAuditDto) {
    return this.aftersaleService.adminAudit(id, dto);
  }
}
