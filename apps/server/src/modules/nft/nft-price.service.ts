import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftEntity } from '../../database/entities/nft.entity';
import { NftPriceHistoryEntity } from '../../database/entities/nft-price-history.entity';
import { NftConfigService } from './nft-config.service';

export interface DealPriceResult {
  dealPrice: number;
  referencePrice: number;
  randomFactor: number;
  dealPremiumPct: number;
  dealPriceMin: number;
  dealPriceMax: number;
}

@Injectable()
export class NftPriceService {
  constructor(
    private readonly nftConfig: NftConfigService,
    @InjectRepository(NftEntity) private readonly nfts: Repository<NftEntity>,
    @InjectRepository(NftPriceHistoryEntity)
    private readonly priceHistory: Repository<NftPriceHistoryEntity>,
  ) {}

  roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  calcDealPrice(currentPrice: number, dealPremiumPct: number): DealPriceResult {
    const referencePrice = this.roundMoney(currentPrice);
    const randomFactor = Math.random();
    const dealPrice = this.roundMoney(referencePrice * (1 + randomFactor * dealPremiumPct));
    return {
      dealPrice,
      referencePrice,
      randomFactor,
      dealPremiumPct,
      dealPriceMin: referencePrice,
      dealPriceMax: this.roundMoney(referencePrice * (1 + dealPremiumPct)),
    };
  }

  getDealPriceRange(currentPrice: number, dealPremiumPct: number) {
    const referencePrice = this.roundMoney(currentPrice);
    return {
      referencePrice,
      dealPriceMin: referencePrice,
      dealPriceMax: this.roundMoney(referencePrice * (1 + dealPremiumPct)),
      dealPremiumPct,
    };
  }

  formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  async ensureDailyPricesUpdated() {
    const rules = await this.nftConfig.getMarketRules();
    const today = this.formatDate(new Date());
    const rows = await this.nfts.find();
    for (const nft of rows) {
      if (nft.lastPriceDate === today) continue;
      await this.applyDailyFluctuation(nft, rules.dailyFluctuationPct, today);
    }
  }

  async applyDailyFluctuation(nft: NftEntity, dailyFluctuationPct: number, today: string) {
    const previousPrice = nft.currentPrice > 0 ? nft.currentPrice : nft.startPrice;
    let nextPrice = previousPrice;

    if (nft.lastPriceDate) {
      const changePct = (Math.random() * 2 - 1) * dailyFluctuationPct;
      nextPrice = this.roundMoney(Math.max(0.01, previousPrice * (1 + changePct)));
      await this.savePriceHistory(nft.id, today, nextPrice, changePct);
    } else {
      await this.savePriceHistory(nft.id, today, previousPrice, 0);
    }

    nft.currentPrice = nextPrice;
    nft.exchangeFund = nextPrice;
    nft.lastPriceDate = today;
    await this.nfts.save(nft);
  }

  async recordInitialPrice(nftId: string, price: number, date?: string) {
    const priceDate = date ?? this.formatDate(new Date());
    const existing = await this.priceHistory.findOne({ where: { nftId, priceDate } });
    if (existing) return;
    await this.savePriceHistory(nftId, priceDate, price, 0);
  }

  async savePriceHistory(nftId: string, priceDate: string, price: number, changePct: number) {
    const existing = await this.priceHistory.findOne({ where: { nftId, priceDate } });
    if (existing) {
      existing.price = price;
      existing.changePct = changePct;
      await this.priceHistory.save(existing);
      return;
    }
    await this.priceHistory.save(
      this.priceHistory.create({ nftId, priceDate, price, changePct }),
    );
  }

  async getPriceHistory(nftId: string, days = 30) {
    const rows = await this.priceHistory.find({
      where: { nftId },
      order: { priceDate: 'DESC' },
      take: days,
    });

    return rows
      .reverse()
      .map((row) => ({
        date: row.priceDate,
        price: row.price,
        changePct: row.changePct ?? 0,
      }));
  }

  async getLatestPricesForNfts(nftIds: string[]) {
    if (!nftIds.length) return new Map<string, NftPriceHistoryEntity[]>();

    const rows = await this.priceHistory
      .createQueryBuilder('h')
      .where('h.nft_id IN (:...nftIds)', { nftIds })
      .orderBy('h.price_date', 'DESC')
      .getMany();

    const map = new Map<string, NftPriceHistoryEntity[]>();
    for (const row of rows) {
      const list = map.get(row.nftId) ?? [];
      if (list.length < 30) list.push(row);
      map.set(row.nftId, list);
    }
    return map;
  }
}
