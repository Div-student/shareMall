import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import {
  AdminCreateNftDto,
  AdminNftMarketDto,
  AdminUpdateNftDto,
  CreateListingDto,
  NftListQueryDto,
  TradeRecordQueryDto,
  UpdateListingDto,
} from './dto';
import { NftTradeService } from './nft-trade.service';
import { NftService } from './nft.service';

@ApiTags('NFT')
@Controller('nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftTradeService: NftTradeService,
  ) {}

  @Get()
  @ApiOperation({ summary: '藏品兑换商城列表' })
  market(@Query() query: NftListQueryDto) {
    return this.nftService.marketList(query);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '我的藏品' })
  mine(@CurrentUser('sub') userId: string, @Query() query: NftListQueryDto) {
    return this.nftService.mineList(userId, query);
  }

  @Get('mine/:userNftId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '持有藏品详情' })
  mineDetail(@CurrentUser('sub') userId: string, @Param('userNftId') userNftId: string) {
    return this.nftTradeService.getUserNftDetail(userId, userNftId);
  }

  @Get('trade/config')
  @ApiOperation({ summary: '二级市场配置' })
  tradeConfig() {
    return this.nftTradeService.getTradeConfig();
  }

  @Get('trade/records')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '交易记录' })
  tradeRecords(@CurrentUser('sub') userId: string, @Query() query: TradeRecordQueryDto) {
    return this.nftTradeService.tradeRecords(userId, query);
  }

  @Get('trade')
  @ApiOperation({ summary: '二级市场在售列表' })
  trade(@Query() query: NftListQueryDto) {
    return this.nftTradeService.tradeMarketList(query);
  }

  @Get('listings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '我的挂单' })
  myListings(@CurrentUser('sub') userId: string, @Query() query: NftListQueryDto) {
    return this.nftTradeService.myListings(userId, query);
  }

  @Post('listings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '挂单卖出' })
  createListing(@CurrentUser('sub') userId: string, @Body() dto: CreateListingDto) {
    return this.nftTradeService.createListing(userId, dto);
  }

  @Put('listings/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '刷新挂单参考价（同步当前价）' })
  refreshListing(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.nftTradeService.updateListing(userId, id);
  }

  @Delete('listings/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '撤单' })
  cancelListing(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.nftTradeService.cancelListing(userId, id);
  }

  @Post('trade/:listingId/buy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '购买挂单（成交，卖家所得入提现金）' })
  buy(@CurrentUser('sub') userId: string, @Param('listingId') listingId: string) {
    return this.nftTradeService.buyListing(userId, listingId);
  }

  @Get(':id/price-history')
  @ApiOperation({ summary: '藏品价格走势' })
  priceHistory(@Param('id') id: string, @Query('days') days?: number) {
    return this.nftService.getPriceHistory(id, days ? Number(days) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: '藏品详情' })
  detail(@Param('id') id: string) {
    return this.nftService.getDetail(id);
  }

  @Post(':id/exchange')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '兑换藏品（扣可用贡献金）' })
  exchange(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.nftService.exchange(userId, id);
  }
}

@ApiTags('Admin-NFT')
@Controller('admin/nft')
export class AdminNftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftTradeService: NftTradeService,
  ) {}

  @Get()
  @ApiOperation({ summary: '藏品列表（后台）' })
  list(@Query() query: NftListQueryDto) {
    return this.nftService.adminList(query);
  }

  @Get('market')
  @ApiOperation({ summary: '二级市场配置（后台）' })
  marketConfig() {
    return this.nftTradeService.adminGetMarket();
  }

  @Put('market')
  @ApiOperation({ summary: '更新二级市场配置（后台）' })
  saveMarketConfig(@Body() dto: AdminNftMarketDto) {
    return this.nftTradeService.adminSaveMarket(dto);
  }

  @Post()
  @ApiOperation({ summary: '发行藏品' })
  create(@Body() dto: AdminCreateNftDto) {
    return this.nftService.adminCreate(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新藏品' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateNftDto) {
    return this.nftService.adminUpdate(id, dto);
  }
}
