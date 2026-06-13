import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';
import { NftListingEntity } from '../../database/entities/nft-listing.entity';
import { NftPriceHistoryEntity } from '../../database/entities/nft-price-history.entity';
import { NftTradeEntity } from '../../database/entities/nft-trade.entity';
import { NftEntity } from '../../database/entities/nft.entity';
import { UserNftEntity } from '../../database/entities/user-nft.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundModule } from '../fund/fund.module';
import { AdminNftController, NftController } from './nft.controller';
import { NftConfigService } from './nft-config.service';
import { NftPriceService } from './nft-price.service';
import { NftTradeService } from './nft-trade.service';
import { NftService } from './nft.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NftEntity,
      UserNftEntity,
      NftListingEntity,
      NftTradeEntity,
      NftPriceHistoryEntity,
      UserEntity,
      ConfigEntity,
    ]),
    FundModule,
  ],
  controllers: [NftController, AdminNftController],
  providers: [NftService, NftTradeService, NftConfigService, NftPriceService],
  exports: [NftService, NftTradeService, NftPriceService],
})
export class NftModule {}
