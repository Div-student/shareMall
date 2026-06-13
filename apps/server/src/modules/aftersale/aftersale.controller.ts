import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { AftersaleService } from './aftersale.service';
import { AftersaleListQueryDto, ApplyAftersaleDto } from './dto';

@ApiTags('Aftersale')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('aftersale')
export class AftersaleController {
  constructor(private readonly aftersaleService: AftersaleService) {}

  @Post()
  @ApiOperation({ summary: '申请售后' })
  apply(@CurrentUser('sub') userId: string, @Body() dto: ApplyAftersaleDto) {
    return this.aftersaleService.apply(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '我的售后列表' })
  list(@CurrentUser('sub') userId: string, @Query() query: AftersaleListQueryDto) {
    return this.aftersaleService.list(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '售后详情' })
  detail(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.aftersaleService.detail(userId, id);
  }
}
