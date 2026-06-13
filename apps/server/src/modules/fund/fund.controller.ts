import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { FundConfigService } from './fund-config.service';
import { AdminAccrueDto, AdminFundRulesDto, FundRecordQueryDto, SignCheckinDto, StartCheckinDto } from './dto';
import { FundService } from './fund.service';

@ApiTags('Fund')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get('account')
  @ApiOperation({ summary: '资产总览（三类资产 + 档位）' })
  account(@CurrentUser('sub') userId: string) {
    return this.fundService.getAccount(userId);
  }

  @Get('records')
  @ApiOperation({ summary: '贡献金/提现金流水' })
  records(@CurrentUser('sub') userId: string, @Query() query: FundRecordQueryDto) {
    return this.fundService.listRecords(userId, query);
  }

  @Post('checkin/start')
  @ApiOperation({ summary: '发起打卡（达档位）' })
  startCheckin(@CurrentUser('sub') userId: string, @Body() dto: StartCheckinDto) {
    return this.fundService.startCheckin(userId, dto.tier);
  }

  @Post('checkin/sign')
  @ApiOperation({ summary: '每日打卡签到' })
  sign(@CurrentUser('sub') userId: string, @Body() dto: SignCheckinDto) {
    return this.fundService.signCheckin(userId, String(dto.planId));
  }

  @Get('checkin/:planId')
  @ApiOperation({ summary: '打卡计划详情' })
  plan(@CurrentUser('sub') userId: string, @Param('planId') planId: string) {
    return this.fundService.getPlan(userId, planId);
  }

  @Get('checkin/:planId/records')
  @ApiOperation({ summary: '打卡每日记录' })
  planRecords(@CurrentUser('sub') userId: string, @Param('planId') planId: string) {
    return this.fundService.getPlanRecords(userId, planId);
  }
}

@ApiTags('Admin-Fund')
@Controller('admin/fund')
export class AdminFundController {
  constructor(
    private readonly fundConfig: FundConfigService,
    private readonly fundService: FundService,
  ) {}

  @Get('rules')
  @ApiOperation({ summary: '贡献金规则配置' })
  getRules() {
    return this.fundConfig.getRules();
  }

  @Put('rules')
  @ApiOperation({ summary: '保存贡献金规则配置' })
  saveRules(@Body() dto: AdminFundRulesDto) {
    return this.fundConfig.saveRules(dto);
  }

  @Post('accrue')
  @ApiOperation({ summary: '测试充值资产（开发/运营）' })
  accrue(@Body() dto: AdminAccrueDto) {
    return this.fundService.accrueByPhone(
      dto.phone,
      dto.amount,
      dto.assetType ?? 'pending_fund',
      dto.remark,
    );
  }
}
