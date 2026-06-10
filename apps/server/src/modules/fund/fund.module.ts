import { Module } from '@nestjs/common';
import { FundController } from './fund.controller';

@Module({
  controllers: [FundController],
})
export class FundModule {}
