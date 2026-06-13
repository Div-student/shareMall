import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { NftEntity } from '../../database/entities/nft.entity';
import { UserNftEntity } from '../../database/entities/user-nft.entity';
import { FundService } from '../fund/fund.service';
import { AdminCreateNftDto, AdminUpdateNftDto, NftListQueryDto } from './dto';
import { NftConfigService } from './nft-config.service';
import { NftPriceService } from './nft-price.service';

const DEFAULT_NFTS: Array<
  Pick<
    NftEntity,
    | 'name'
    | 'cover'
    | 'publisher'
    | 'totalSupply'
    | 'stock'
    | 'exchangeFund'
    | 'startPrice'
    | 'currentPrice'
    | 'limitPerUser'
    | 'rightsDesc'
    | 'status'
  >
> = [
  {
    name: '星际探索者',
    cover: 'https://picsum.photos/seed/nft-explorer/400',
    publisher: 'ShareMall IP Lab',
    totalSupply: 1000,
    stock: 1000,
    exchangeFund: 10,
    startPrice: 10,
    currentPrice: 10,
    limitPerUser: 3,
    rightsDesc: '限量数字 IP 藏品，持有者可参与社区专属活动。',
    status: 'on_sale',
  },
  {
    name: '潮玩联名款',
    cover: 'https://picsum.photos/seed/nft-toy/400',
    publisher: 'ShareMall IP Lab',
    totalSupply: 500,
    stock: 500,
    exchangeFund: 30,
    startPrice: 30,
    currentPrice: 30,
    limitPerUser: 2,
    rightsDesc: '潮玩主题数字藏品，可在二级市场自由流转。',
    status: 'on_sale',
  },
  {
    name: '典藏徽章',
    cover: 'https://picsum.photos/seed/nft-badge/400',
    publisher: 'ShareMall IP Lab',
    totalSupply: 200,
    stock: 200,
    exchangeFund: 50,
    startPrice: 50,
    currentPrice: 50,
    limitPerUser: 1,
    rightsDesc: '平台典藏系列，每人限兑 1 份。',
    status: 'on_sale',
  },
];

@Injectable()
export class NftService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundService: FundService,
    private readonly nftConfig: NftConfigService,
    private readonly nftPrice: NftPriceService,
    @InjectRepository(NftEntity) private readonly nfts: Repository<NftEntity>,
    @InjectRepository(UserNftEntity) private readonly userNfts: Repository<UserNftEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.nfts.count();
    if (count === 0) {
      const rows = await this.nfts.save(DEFAULT_NFTS.map((item) => this.nfts.create(item)));
      for (const row of rows) {
        await this.nftPrice.recordInitialPrice(row.id, row.startPrice);
      }
    }
    await this.nftPrice.ensureDailyPricesUpdated();
  }

  async marketList(query: NftListQueryDto) {
    await this.nftPrice.ensureDailyPricesUpdated();
    const rules = await this.nftConfig.getMarketRules();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [rows, total] = await this.nfts.findAndCount({
      where: { status: 'on_sale' },
      order: { id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: rows.map((item) => this.toMarketVo(item, rules.dealPremiumPct)),
      total,
    };
  }

  async getDetail(id: string) {
    await this.nftPrice.ensureDailyPricesUpdated();
    const rules = await this.nftConfig.getMarketRules();
    const nft = await this.nfts.findOne({ where: { id } });
    if (!nft || nft.status !== 'on_sale') {
      throw new NotFoundException('藏品不存在或已下架');
    }
    const priceHistory = await this.nftPrice.getPriceHistory(id, 30);
    return {
      ...this.toDetailVo(nft, rules.dealPremiumPct),
      priceHistory,
    };
  }

  async getPriceHistory(id: string, days = 30) {
    const nft = await this.nfts.findOne({ where: { id } });
    if (!nft) throw new NotFoundException('藏品不存在');
    await this.nftPrice.ensureDailyPricesUpdated();
    return this.nftPrice.getPriceHistory(id, days);
  }

  async exchange(userId: string, nftId: string) {
    await this.nftPrice.ensureDailyPricesUpdated();
    const rules = await this.nftConfig.getMarketRules();

    return this.dataSource.transaction(async (manager) => {
      const nftRepo = manager.getRepository(NftEntity);
      const userNftRepo = manager.getRepository(UserNftEntity);

      const nft = await nftRepo.findOne({ where: { id: nftId } });
      if (!nft || nft.status !== 'on_sale') {
        throw new NotFoundException('藏品不存在或已下架');
      }
      if (nft.stock <= 0) {
        throw new BadRequestException('库存不足');
      }

      const freshDeal = this.nftPrice.calcDealPrice(nft.currentPrice, rules.dealPremiumPct);

      if (nft.limitPerUser > 0) {
        const owned = await userNftRepo.count({
          where: { userId, nftId: nft.id, source: 'exchange' },
        });
        if (owned >= nft.limitPerUser) {
          throw new BadRequestException(`每人限兑 ${nft.limitPerUser} 份`);
        }
      }

      const account = await this.fundService.getAccount(userId);
      if (account.availableFund < freshDeal.dealPrice) {
        throw new BadRequestException('可用贡献金不足');
      }

      const updateResult = await nftRepo
        .createQueryBuilder()
        .update(NftEntity)
        .set({ stock: () => 'stock - 1' })
        .where('id = :id AND stock > 0 AND status = :status', { id: nftId, status: 'on_sale' })
        .execute();

      if (!updateResult.affected) {
        throw new BadRequestException('库存不足或已下架');
      }

      await this.fundService.deductAvailableForNftExchange(
        manager,
        userId,
        freshDeal.dealPrice,
        nft.id,
        nft.name,
      );

      const issuedCount = await userNftRepo.count({ where: { nftId: nft.id } });
      const serialNo = this.buildSerialNo(nft.id, issuedCount + 1);
      const now = new Date();

      const userNft = await userNftRepo.save(
        userNftRepo.create({
          userId,
          nftId: nft.id,
          serialNo,
          source: 'exchange',
          status: 'holding',
          acquiredAt: now,
        }),
      );

      return {
        success: true,
        userNftId: Number(userNft.id),
        serialNo: userNft.serialNo,
        dealPrice: freshDeal.dealPrice,
        referencePrice: freshDeal.referencePrice,
        exchangeFund: freshDeal.dealPrice,
      };
    });
  }

  async mineList(userId: string, query: NftListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [rows, total] = await this.userNfts.findAndCount({
      where: { userId },
      order: { acquiredAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const nftIds = [...new Set(rows.map((item) => item.nftId))];
    const nftMap = new Map<string, NftEntity>();

    if (nftIds.length) {
      const nftRows = await this.nfts.find({ where: { id: In(nftIds) } });
      nftRows.forEach((item) => nftMap.set(item.id, item));
    }

    return {
      list: rows.map((item) => {
        const nft = nftMap.get(item.nftId);
        return {
          id: Number(item.id),
          nftId: Number(item.nftId),
          name: nft?.name ?? '',
          cover: nft?.cover ?? '',
          serialNo: item.serialNo,
          status: item.status,
          source: item.source,
          acquiredAt: item.acquiredAt,
          currentPrice: nft?.currentPrice ?? 0,
        };
      }),
      total,
    };
  }

  async adminList(query: NftListQueryDto) {
    await this.nftPrice.ensureDailyPricesUpdated();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;

    const [rows, total] = await this.nfts.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: rows.map((item) => this.toAdminVo(item)),
      total,
    };
  }

  async adminCreate(dto: AdminCreateNftDto) {
    const startPrice = dto.startPrice ?? dto.exchangeFund ?? 0;
    const nft = await this.nfts.save(
      this.nfts.create({
        name: dto.name,
        cover: dto.cover,
        publisher: dto.publisher,
        totalSupply: dto.totalSupply,
        stock: dto.totalSupply,
        exchangeFund: startPrice,
        startPrice,
        currentPrice: startPrice,
        lastPriceDate: this.nftPrice.formatDate(new Date()),
        limitPerUser: dto.limitPerUser ?? 0,
        rightsDesc: dto.rightsDesc,
        status: dto.status ?? 'off_shelf',
      }),
    );
    await this.nftPrice.recordInitialPrice(nft.id, startPrice);
    return this.toAdminVo(nft);
  }

  async adminUpdate(id: string, dto: AdminUpdateNftDto) {
    const nft = await this.nfts.findOne({ where: { id } });
    if (!nft) throw new NotFoundException('藏品不存在');

    if (dto.name !== undefined) nft.name = dto.name;
    if (dto.cover !== undefined) nft.cover = dto.cover;
    if (dto.publisher !== undefined) nft.publisher = dto.publisher;
    if (dto.stock !== undefined) {
      if (dto.stock > nft.totalSupply) {
        throw new BadRequestException('库存不能大于发行量');
      }
      nft.stock = dto.stock;
    }
    if (dto.startPrice !== undefined) {
      nft.startPrice = dto.startPrice;
    }
    if (dto.exchangeFund !== undefined && dto.startPrice === undefined) {
      nft.startPrice = dto.exchangeFund;
    }
    if (dto.limitPerUser !== undefined) nft.limitPerUser = dto.limitPerUser;
    if (dto.rightsDesc !== undefined) nft.rightsDesc = dto.rightsDesc;
    if (dto.status !== undefined) nft.status = dto.status;

    await this.nfts.save(nft);
    return this.toAdminVo(nft);
  }

  private buildSerialNo(nftId: string, sequence: number) {
    return `NFT${String(nftId).padStart(4, '0')}-${String(sequence).padStart(6, '0')}`;
  }

  private toMarketVo(nft: NftEntity, dealPremiumPct: number) {
    const range = this.nftPrice.getDealPriceRange(nft.currentPrice, dealPremiumPct);
    return {
      id: Number(nft.id),
      name: nft.name,
      cover: nft.cover,
      publisher: nft.publisher ?? '',
      startPrice: nft.startPrice,
      currentPrice: nft.currentPrice,
      exchangeFund: nft.currentPrice,
      dealPriceMin: range.dealPriceMin,
      dealPriceMax: range.dealPriceMax,
      stock: nft.stock,
      totalSupply: nft.totalSupply,
      limitPerUser: nft.limitPerUser,
    };
  }

  private toDetailVo(nft: NftEntity, dealPremiumPct: number) {
    const range = this.nftPrice.getDealPriceRange(nft.currentPrice, dealPremiumPct);
    return {
      ...this.toMarketVo(nft, dealPremiumPct),
      rightsDesc: nft.rightsDesc ?? '',
      soldCount: nft.totalSupply - nft.stock,
      dealPremiumPct,
    };
  }

  private toAdminVo(nft: NftEntity) {
    return {
      id: Number(nft.id),
      name: nft.name,
      cover: nft.cover,
      publisher: nft.publisher ?? '',
      totalSupply: nft.totalSupply,
      stock: nft.stock,
      startPrice: nft.startPrice,
      currentPrice: nft.currentPrice,
      exchangeFund: nft.currentPrice,
      limitPerUser: nft.limitPerUser,
      rightsDesc: nft.rightsDesc ?? '',
      status: nft.status,
      soldCount: nft.totalSupply - nft.stock,
      lastPriceDate: nft.lastPriceDate ?? null,
      createdAt: nft.createdAt,
    };
  }
}
