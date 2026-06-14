import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { FundModule } from './modules/fund/fund.module';
import { NftModule } from './modules/nft/nft.module';
import { UserModule } from './modules/user/user.module';
import { WithdrawModule } from './modules/withdraw/withdraw.module';
import { AftersaleModule } from './modules/aftersale/aftersale.module';
import { AdminModule } from './modules/admin/admin.module';
import { TaskModule } from './modules/task/task.module';
import { MessageModule } from './modules/message/message.module';
import { ReviewModule } from './modules/review/review.module';
import { FinanceModule } from './modules/finance/finance.module';
import { OperationsModule } from './modules/operations/operations.module';
import { SmsModule } from './common/sms/sms.module';
import { AuthCommonModule } from './common/auth/auth-common.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'sharemall'),
        autoLoadEntities: true,
        synchronize: false,
        timezone: '+08:00',
        charset: 'utf8mb4',
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev_secret'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
    SmsModule,
    AuthCommonModule,
    AuthModule,
    ProductModule,
    OrderModule,
    FundModule,
    NftModule,
    UserModule,
    WithdrawModule,
    AftersaleModule,
    TaskModule,
    MessageModule,
    ReviewModule,
    FinanceModule,
    OperationsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
