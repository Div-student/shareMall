import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('NFT')
@Controller('nft')
export class NftController {
  @Get()
  @ApiOperation({ summary: '藏品兑换商城列表' })
  market() {
    return { list: [], total: 0 };
  }

  @Get('mine')
  @ApiOperation({ summary: '我的藏品' })
  mine() {
    return { list: [], total: 0 };
  }

  @Post(':id/exchange')
  @ApiOperation({ summary: '兑换藏品（扣可用贡献金）' })
  exchange(@Param('id') _id: string) {
    // TODO: 校验库存/限购，扣减可用贡献金，发放藏品
    return { success: true };
  }

  @Post('listings')
  @ApiOperation({ summary: '挂单卖出' })
  createListing(@Body() _body: { userNftId: number; price: number }) {
    // TODO: 校验持有/实名，计算手续费与预计到账（提现金）
    return { listingId: 1, fee: 0, estimateIncome: 0 };
  }

  @Get('trade')
  @ApiOperation({ summary: '二级市场在售列表' })
  trade() {
    return { list: [], total: 0 };
  }

  @Post('trade/:listingId/buy')
  @ApiOperation({ summary: '购买挂单（成交，卖家所得入提现金）' })
  buy(@Param('listingId') _listingId: string) {
    // TODO: 成交转移归属，卖家所得(price - fee)入提现金
    return { success: true };
  }
}
