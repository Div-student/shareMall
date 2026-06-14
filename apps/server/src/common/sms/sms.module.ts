import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';
import { SmsConfigService } from './sms-config.service';
import { SmsService } from './sms.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity])],
  providers: [SmsService, SmsConfigService],
  exports: [SmsService, SmsConfigService],
})
export class SmsModule {}
