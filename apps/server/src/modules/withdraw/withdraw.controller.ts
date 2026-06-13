import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ApplyWithdrawDto, WithdrawRecordQueryDto } from './dto';
import { WithdrawService } from './withdraw.service';

@ApiTags('Withdraw')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Get('withdraw/config')
  @ApiOperation({ summary: '提现规则' })
  config() {
    return this.withdrawService.getConfig();
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现（提现金）' })
  apply(@CurrentUser('sub') userId: string, @Body() dto: ApplyWithdrawDto) {
    return this.withdrawService.apply(userId, dto);
  }

  @Get('withdraw/records')
  @ApiOperation({ summary: '提现记录' })
  records(@CurrentUser('sub') userId: string, @Query() query: WithdrawRecordQueryDto) {
    return this.withdrawService.listRecords(userId, query);
  }
}
