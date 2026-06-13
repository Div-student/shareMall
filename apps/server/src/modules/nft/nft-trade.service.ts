import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { NftListingEntity } from '../../database/entities/nft-listing.entity';
import { NftTradeEntity } from '../../database/entities/nft-trade.entity';
import { NftEntity } from '../../database/entities/nft.entity';
import { UserNftEntity } from '../../database/entities/user-nft.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundConfigService } from '../fund/fund-config.service';
import { FundService } from '../fund/fund.service';
import {
  AdminNftMarketDto,
  CreateListingDto,
  NftListQueryDto,
  TradeRecordQueryDto,
} from './dto';
import { NftConfigService, NftMarketRules } from './nft-config.service';
import { NftPriceService } from './nft-price.service';

@Injectable()
export class NftTradeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundService: FundService,
    private readonly fundConfig: FundConfigService,
    private readonly nftConfig: NftConfigService,
    private readonly nftPrice: NftPriceService,
    @InjectRepository(NftEntity) private readonly nfts: Repository<NftEntity>,
    @InjectRepository(UserNftEntity) private readonly userNfts: Repository<UserNftEntity>,
    @InjectRepository(NftListingEntity) private readonly listings: Repository<NftListingEntity>,
    @InjectRepository(NftTradeEntity) private readonly trades: Repository<NftTradeEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async getTradeConfig() {
    const [market, fundRules] = await Promise.all([
      this.nftConfig.getMarketRules(),
      this.fundConfig.getRules(),
    ]);
    return {
      enabled: market.enabled,
      feeRate: fundRules.marketFeeRate,
      minPrice: market.minPrice,
      maxPrice: market.maxPrice,
      requireKyc: market.requireKyc,
      dailyFluctuationPct: market.dailyFluctuationPct,
      dealPremiumPct: market.dealPremiumPct,
    };
  }

  async getUserNftDetail(userId: string, userNftId: string) {
    const userNft = await this.userNfts.findOne({ where: { id: userNftId, userId } });
    if (!userNft) throw new NotFoundException('藏品不存在');

    const activeListing = await this.listings.findOne({
      where: { userNftId: userNft.id, status: 'listing' },
    });

    const nft = await this.nfts.findOne({ where: { id: userNft.nftId } });
    if (!nft) throw new NotFoundException('藏品信息不存在');

    await this.nftPrice.ensureDailyPricesUpdated();
    const rules = await this.nftConfig.getMarketRules();
    const range = this.nftPrice.getDealPriceRange(nft.currentPrice, rules.dealPremiumPct);

    return {
      id: Number(userNft.id),
      nftId: Number(userNft.nftId),
      name: nft?.name ?? '',
      cover: nft?.cover ?? '',
      serialNo: userNft.serialNo,
      status: userNft.status,
      source: userNft.source,
      acquiredAt: userNft.acquiredAt,
      currentPrice: nft.currentPrice,
      dealPriceMin: range.dealPriceMin,
      dealPriceMax: range.dealPriceMax,
      activeListing: activeListing
        ? {
            id: Number(activeListing.id),
            price: activeListing.price,
            feeRate: activeListing.feeRate,
            createdAt: activeListing.createdAt,
          }
        : null,
    };
  }

  async createListing(userId: string, dto: CreateListingDto) {
    const market = await this.nftConfig.getMarketRules();
    if (!market.enabled) throw new BadRequestException('二级市场暂未开放');

    await this.assertKycIfRequired(userId, market);
    await this.nftPrice.ensureDailyPricesUpdated();

    const userNft = await this.userNfts.findOne({
      where: { id: String(dto.userNftId), userId },
    });
    if (!userNft) throw new NotFoundException('藏品不存在');
    if (userNft.status !== 'holding') {
      throw new BadRequestException('当前藏品不可挂单');
    }

    const nft = await this.nfts.findOne({ where: { id: userNft.nftId } });
    if (!nft) throw new NotFoundException('藏品信息不存在');

    const price = nft.currentPrice;
    this.assertPriceRange(price, market);

    const existing = await this.listings.findOne({
      where: { userNftId: userNft.id, status: 'listing' },
    });
    if (existing) throw new BadRequestException('该藏品已在售');

    const fundRules = await this.fundConfig.getRules();
    const feeRate = fundRules.marketFeeRate;
    const range = this.nftPrice.getDealPriceRange(nft.currentPrice, market.dealPremiumPct);
    const fee = this.calcFee(range.dealPriceMax, feeRate);
    const estimateIncome = this.roundMoney(range.dealPriceMax - fee);

    const listing = await this.dataSource.transaction(async (manager) => {
      const listingRepo = manager.getRepository(NftListingEntity);
      const userNftRepo = manager.getRepository(UserNftEntity);

      const row = await listingRepo.save(
        listingRepo.create({
          userNftId: userNft.id,
          sellerId: userId,
          price,
          feeRate,
          status: 'listing',
        }),
      );

      userNft.status = 'listed';
      await userNftRepo.save(userNft);
      return row;
    });

    return {
      listingId: Number(listing.id),
      referencePrice: price,
      dealPriceMin: range.dealPriceMin,
      dealPriceMax: range.dealPriceMax,
      fee,
      feeRate,
      estimateIncome,
    };
  }

  async myListings(userId: string, query: NftListQueryDto) {
    const market = await this.nftConfig.getMarketRules();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [rows, total] = await this.listings.findAndCount({
      where: { sellerId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: await this.enrichListings(rows, false, market.dealPremiumPct),
      total,
    };
  }

  async updateListing(userId: string, listingId: string) {
    const market = await this.nftConfig.getMarketRules();
    if (!market.enabled) throw new BadRequestException('二级市场暂未开放');

    const listing = await this.listings.findOne({ where: { id: listingId, sellerId: userId } });
    if (!listing) throw new NotFoundException('挂单不存在');
    if (listing.status !== 'listing') throw new BadRequestException('当前挂单不可刷新');

    await this.nftPrice.ensureDailyPricesUpdated();

    const userNft = await this.userNfts.findOne({ where: { id: listing.userNftId } });
    const nft = userNft ? await this.nfts.findOne({ where: { id: userNft.nftId } }) : null;
    if (!nft) throw new NotFoundException('藏品信息不存在');

    const normalizedPrice = nft.currentPrice;
    this.assertPriceRange(normalizedPrice, market);

    listing.price = normalizedPrice;
    await this.listings.save(listing);

    const fee = this.calcFee(
      this.nftPrice.getDealPriceRange(nft.currentPrice, market.dealPremiumPct).dealPriceMax,
      listing.feeRate,
    );
    const range = this.nftPrice.getDealPriceRange(nft.currentPrice, market.dealPremiumPct);
    return {
      success: true,
      referencePrice: normalizedPrice,
      dealPriceMin: range.dealPriceMin,
      dealPriceMax: range.dealPriceMax,
      fee,
      estimateIncome: this.roundMoney(range.dealPriceMax - fee),
    };
  }

  async cancelListing(userId: string, listingId: string) {
    const listing = await this.listings.findOne({ where: { id: listingId, sellerId: userId } });
    if (!listing) throw new NotFoundException('挂单不存在');
    if (listing.status !== 'listing') throw new BadRequestException('当前挂单不可撤销');

    await this.dataSource.transaction(async (manager) => {
      const listingRepo = manager.getRepository(NftListingEntity);
      const userNftRepo = manager.getRepository(UserNftEntity);

      listing.status = 'cancelled';
      await listingRepo.save(listing);

      const userNft = await userNftRepo.findOne({ where: { id: listing.userNftId } });
      if (userNft && userNft.status === 'listed') {
        userNft.status = 'holding';
        await userNftRepo.save(userNft);
      }
    });

    return { success: true };
  }

  async tradeMarketList(query: NftListQueryDto) {
    const market = await this.nftConfig.getMarketRules();
    await this.nftPrice.ensureDailyPricesUpdated();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [rows, total] = await this.listings.findAndCount({
      where: { status: 'listing' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      enabled: market.enabled,
      dealPremiumPct: market.dealPremiumPct,
      list: await this.enrichListings(rows, true, market.dealPremiumPct),
      total,
    };
  }

  async buyListing(buyerId: string, listingId: string) {
    const market = await this.nftConfig.getMarketRules();
    if (!market.enabled) throw new BadRequestException('二级市场暂未开放');

    await this.assertKycIfRequired(buyerId, market);
    await this.nftPrice.ensureDailyPricesUpdated();

    const listing = await this.listings.findOne({ where: { id: listingId, status: 'listing' } });
    if (!listing) throw new NotFoundException('挂单不存在或已下架');
    if (listing.sellerId === buyerId) throw new BadRequestException('不能购买自己的挂单');

    const sellerUserNft = await this.userNfts.findOne({ where: { id: listing.userNftId } });
    if (!sellerUserNft || sellerUserNft.status !== 'listed') {
      throw new BadRequestException('挂单藏品状态异常');
    }

    const nft = await this.nfts.findOne({ where: { id: sellerUserNft.nftId } });
    if (!nft) throw new NotFoundException('藏品信息不存在');

    const deal = this.nftPrice.calcDealPrice(nft.currentPrice, market.dealPremiumPct);

    const account = await this.fundService.getAccount(buyerId);
    if (account.availableFund < deal.dealPrice) {
      throw new BadRequestException('可用贡献金不足');
    }

    const fee = this.calcFee(deal.dealPrice, listing.feeRate);
    const sellerIncome = this.roundMoney(deal.dealPrice - fee);

    return this.dataSource.transaction(async (manager) => {
      const listingRepo = manager.getRepository(NftListingEntity);
      const userNftRepo = manager.getRepository(UserNftEntity);
      const tradeRepo = manager.getRepository(NftTradeEntity);

      const locked = await listingRepo
        .createQueryBuilder('l')
        .setLock('pessimistic_write')
        .where('l.id = :id AND l.status = :status', { id: listingId, status: 'listing' })
        .getOne();

      if (!locked) throw new BadRequestException('挂单不存在或已成交');

      const userNft = await userNftRepo.findOne({ where: { id: locked.userNftId } });
      if (!userNft || userNft.status !== 'listed') {
        throw new BadRequestException('挂单藏品状态异常');
      }

      locked.status = 'sold';
      await listingRepo.save(locked);

      const now = new Date();
      userNft.userId = buyerId;
      userNft.source = 'trade_buy';
      userNft.status = 'holding';
      userNft.acquiredAt = now;
      const buyerUserNft = await userNftRepo.save(userNft);

      const trade = await tradeRepo.save(
        tradeRepo.create({
          listingId: locked.id,
          buyerId,
          sellerId: locked.sellerId,
          price: deal.dealPrice,
          referencePrice: deal.referencePrice,
          dealPremiumFactor: deal.randomFactor,
          fee,
          sellerIncome,
          tradedAt: now,
        }),
      );

      await this.fundService.deductAvailableForNftTradeBuy(
        manager,
        buyerId,
        deal.dealPrice,
        trade.id,
        nft.name,
      );

      await this.fundService.addWithdrawableForNftTradeIncome(
        manager,
        locked.sellerId,
        sellerIncome,
      );

      return {
        success: true,
        tradeId: Number(trade.id),
        userNftId: Number(buyerUserNft.id),
        price: deal.dealPrice,
        referencePrice: deal.referencePrice,
        fee,
        sellerIncome,
      };
    });
  }

  async tradeRecords(userId: string, query: TradeRecordQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const type = query.type ?? 'all';

    const qb = this.trades.createQueryBuilder('t').orderBy('t.traded_at', 'DESC');

    if (type === 'buy') {
      qb.where('t.buyer_id = :userId', { userId });
    } else if (type === 'sell') {
      qb.where('t.seller_id = :userId', { userId });
    } else {
      qb.where('(t.buyer_id = :userId OR t.seller_id = :userId)', { userId });
    }

    const [rows, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const listingIds = rows.map((item) => item.listingId);
    const listings = listingIds.length
      ? await this.listings.find({ where: { id: In(listingIds) } })
      : [];
    const listingMap = new Map(listings.map((item) => [item.id, item]));

    const userNftIds = listings.map((item) => item.userNftId);
    const userNfts = userNftIds.length
      ? await this.userNfts.find({ where: { id: In(userNftIds) } })
      : [];
    const userNftMap = new Map(userNfts.map((item) => [item.id, item]));

    const nftIds = [...new Set(userNfts.map((item) => item.nftId))];
    const nftRows = nftIds.length ? await this.nfts.find({ where: { id: In(nftIds) } }) : [];
    const nftMap = new Map(nftRows.map((item) => [item.id, item]));

    return {
      list: rows.map((trade) => {
        const listing = listingMap.get(trade.listingId);
        const userNft = listing ? userNftMap.get(listing.userNftId) : undefined;
        const nft = userNft ? nftMap.get(userNft.nftId) : undefined;
        const role = trade.buyerId === userId ? 'buy' : 'sell';

        return {
          id: Number(trade.id),
          role,
          nftName: nft?.name ?? '',
          cover: nft?.cover ?? '',
          serialNo: userNft?.serialNo ?? '',
          price: trade.price,
          referencePrice: trade.referencePrice ?? trade.price,
          fee: trade.fee,
          sellerIncome: trade.sellerIncome,
          tradedAt: trade.tradedAt,
        };
      }),
      total,
    };
  }

  async adminGetMarket() {
    const [market, fundRules] = await Promise.all([
      this.nftConfig.getMarketRules(),
      this.fundConfig.getRules(),
    ]);
    return {
      ...market,
      feeRate: fundRules.marketFeeRate,
    };
  }

  async adminSaveMarket(dto: AdminNftMarketDto) {
    const current = await this.nftConfig.getMarketRules();
    const next: NftMarketRules = {
      enabled: dto.enabled ?? current.enabled,
      minPrice: dto.minPrice ?? current.minPrice,
      maxPrice: dto.maxPrice ?? current.maxPrice,
      requireKyc: dto.requireKyc ?? current.requireKyc,
      dailyFluctuationPct: dto.dailyFluctuationPct ?? current.dailyFluctuationPct,
      dealPremiumPct: dto.dealPremiumPct ?? current.dealPremiumPct,
    };
    if (next.minPrice > next.maxPrice) {
      throw new BadRequestException('最低价不能大于最高价');
    }
    await this.nftConfig.saveMarketRules(next);
    return this.adminGetMarket();
  }

  private async enrichListings(
    rows: NftListingEntity[],
    maskSeller = false,
    dealPremiumPct = 0.1,
  ) {
    if (!rows.length) return [];

    const userNftIds = rows.map((item) => item.userNftId);
    const userNfts = await this.userNfts.find({ where: { id: In(userNftIds) } });
    const userNftMap = new Map(userNfts.map((item) => [item.id, item]));

    const nftIds = [...new Set(userNfts.map((item) => item.nftId))];
    const nftRows = nftIds.length ? await this.nfts.find({ where: { id: In(nftIds) } }) : [];
    const nftMap = new Map(nftRows.map((item) => [item.id, item]));

    const sellerIds = [...new Set(rows.map((item) => item.sellerId))];
    const sellers = await this.users.find({ where: { id: In(sellerIds) } });
    const sellerMap = new Map(sellers.map((item) => [item.id, item]));

    return rows.map((listing) => {
      const userNft = userNftMap.get(listing.userNftId);
      const nft = userNft ? nftMap.get(userNft.nftId) : undefined;
      const seller = sellerMap.get(listing.sellerId);
      const fee = this.calcFee(listing.price, listing.feeRate);
      const range = nft
        ? this.nftPrice.getDealPriceRange(nft.currentPrice, dealPremiumPct)
        : {
            referencePrice: listing.price,
            dealPriceMin: listing.price,
            dealPriceMax: listing.price,
          };

      return {
        id: Number(listing.id),
        userNftId: Number(listing.userNftId),
        referencePrice: range.referencePrice,
        dealPriceMin: range.dealPriceMin,
        dealPriceMax: range.dealPriceMax,
        price: listing.price,
        feeRate: listing.feeRate,
        fee,
        estimateIncome: this.roundMoney(range.dealPriceMax - this.calcFee(range.dealPriceMax, listing.feeRate)),
        status: listing.status,
        createdAt: listing.createdAt,
        nftId: userNft ? Number(userNft.nftId) : 0,
        name: nft?.name ?? '',
        cover: nft?.cover ?? '',
        serialNo: userNft?.serialNo ?? '',
        sellerId: Number(listing.sellerId),
        sellerName: maskSeller ? this.maskPhone(seller?.phone) : seller?.phone ?? '',
      };
    });
  }

  private async assertKycIfRequired(userId: string, market: NftMarketRules) {
    if (!market.requireKyc) return;
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.kycStatus !== 'passed') {
      throw new BadRequestException('请先完成实名认证');
    }
  }

  private assertPriceRange(price: number, market: NftMarketRules) {
    if (price < market.minPrice || price > market.maxPrice) {
      throw new BadRequestException(`售价需在 ${market.minPrice} ~ ${market.maxPrice} 元之间`);
    }
  }

  private calcFee(price: number, feeRate: number) {
    return this.roundMoney(price * feeRate);
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private maskPhone(phone?: string) {
    if (!phone || phone.length !== 11) return '卖家';
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }
}
