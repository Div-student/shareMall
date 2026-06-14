import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { AdminReviewAuditDto, AdminReviewListQueryDto } from './dto';
import { ReviewService } from './review.service';

@ApiTags('Admin Review')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({ summary: '评价列表' })
  list(@Query() query: AdminReviewListQueryDto) {
    return this.reviewService.adminList(query);
  }

  @Post(':id/audit')
  @ApiOperation({ summary: '审核评价（显示/隐藏）' })
  audit(@Param('id') id: string, @Body() dto: AdminReviewAuditDto) {
    return this.reviewService.adminAudit(id, dto);
  }
}
