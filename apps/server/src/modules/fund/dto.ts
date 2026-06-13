import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FundRecordQueryDto {
  @ApiPropertyOptional({ enum: ['pending_fund', 'available_fund', 'withdrawable_cash'] })
  @IsOptional()
  @IsEnum(['pending_fund', 'available_fund', 'withdrawable_cash'] as const)
  assetType?: 'pending_fund' | 'available_fund' | 'withdrawable_cash';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class StartCheckinDto {
  @ApiProperty({ example: 90 })
  @Type(() => Number)
  @IsInt()
  tier!: number;
}

export class SignCheckinDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  planId!: number;
}

export class AdminFundRulesDto {
  @ApiProperty({ description: '默认贡献金比例，0.05 = 5%' })
  @Type(() => Number)
  @IsNumber()
  defaultRatio!: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @Type(() => Number)
  tiers!: number[];

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  checkinDays!: number;

  @ApiProperty({ enum: ['void', 'makeup'] })
  @IsEnum(['void', 'makeup'] as const)
  missRule!: 'void' | 'makeup';

  @ApiProperty({ description: '抵扣上限比例，0.5 = 50%' })
  @Type(() => Number)
  @IsNumber()
  deductLimitRate!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  marketFeeRate!: number;
}

export class AdminAccrueDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({
    enum: ['pending_fund', 'available_fund', 'withdrawable_cash'],
    default: 'pending_fund',
  })
  @IsOptional()
  @IsEnum(['pending_fund', 'available_fund', 'withdrawable_cash'] as const)
  assetType?: 'pending_fund' | 'available_fund' | 'withdrawable_cash';
}
