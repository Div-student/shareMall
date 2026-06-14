import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { FinanceFlowQueryDto, FinanceReconcileQueryDto, FinanceReportQueryDto } from './dto';
import { FinanceService } from './finance.service';

@ApiTags('Admin Finance')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('flow')
  @ApiOperation({ summary: '资金流水' })
  flow(@Query() query: FinanceFlowQueryDto) {
    return this.financeService.flow(query);
  }

  @Get('reports')
  @ApiOperation({ summary: '报表中心' })
  reports(@Query() query: FinanceReportQueryDto) {
    return this.financeService.reports(query);
  }

  @Get('reconcile')
  @ApiOperation({ summary: '财务对账' })
  reconcile(@Query() query: FinanceReconcileQueryDto) {
    return this.financeService.reconcile(query);
  }
}
