import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FUND_TIERS } from '@sharemall/shared';

@ApiTags('Fund')
@Controller('fund')
export class FundController {
  @Get('account')
  @ApiOperation({ summary: '资产总览（三类资产 + 档位）' })
  account() {
    return {
      pendingFund: 0,
      availableFund: 0,
      withdrawableCash: 0,
      tiers: FUND_TIERS.map((tier) => ({ tier, reached: false })),
    };
  }

  @Get('records')
  @ApiOperation({ summary: '贡献金/提现金流水' })
  records() {
    return { list: [], total: 0 };
  }

  @Post('checkin/start')
  @ApiOperation({ summary: '发起打卡（达档位）' })
  startCheckin(@Body() _body: { tier: number }) {
    // TODO: 校验是否达档位，创建 30 天打卡计划
    return { planId: 1 };
  }

  @Post('checkin/sign')
  @ApiOperation({ summary: '每日打卡签到' })
  sign(@Body() _body: { planId: number }) {
    // TODO: 校验当天未签，兑现 daily 到可用贡献金
    return { cashoutAmount: 0, signedDays: 0 };
  }

  @Get('checkin/:planId')
  @ApiOperation({ summary: '打卡计划详情' })
  plan(@Param('planId') planId: string) {
    return { id: Number(planId) };
  }
}
