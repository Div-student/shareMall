import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ProductReviewListQueryDto, SubmitReviewDto } from './dto';
import { ReviewService } from './review.service';

@ApiTags('Review')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('products/:productId/reviews')
  @ApiOperation({ summary: '商品评价列表（公开）' })
  listByProduct(@Param('productId') productId: string, @Query() query: ProductReviewListQueryDto) {
    return this.reviewService.listByProduct(productId, query);
  }

  @Get('orders/:orderId/review')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '查询订单是否已评价' })
  getOrderReview(@CurrentUser('sub') userId: string, @Param('orderId') orderId: string) {
    return this.reviewService.getOrderReview(userId, orderId);
  }

  @Post('orders/:orderId/review')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '提交订单评价' })
  submit(
    @CurrentUser('sub') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: SubmitReviewDto,
  ) {
    return this.reviewService.submit(userId, orderId, dto);
  }
}
