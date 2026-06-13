import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class NftListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class AdminCreateNftDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  cover!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSupply!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  startPrice!: number;

  @ApiPropertyOptional({ description: '兼容旧字段，等同 startPrice' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  exchangeFund?: number;

  @ApiPropertyOptional({ description: '0=不限' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limitPerUser?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rightsDesc?: string;

  @ApiPropertyOptional({ enum: ['on_sale', 'off_shelf'] })
  @IsOptional()
  @IsEnum(['on_sale', 'off_shelf'] as const)
  status?: 'on_sale' | 'off_shelf';
}

export class AdminUpdateNftDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  startPrice?: number;

  @ApiPropertyOptional({ description: '兼容旧字段' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  exchangeFund?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limitPerUser?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rightsDesc?: string;

  @ApiPropertyOptional({ enum: ['on_sale', 'off_shelf'] })
  @IsOptional()
  @IsEnum(['on_sale', 'off_shelf'] as const)
  status?: 'on_sale' | 'off_shelf';
}

export class CreateListingDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userNftId!: number;
}

export class UpdateListingDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price!: number;
}

export class AdminNftMarketDto {
  @ApiPropertyOptional()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  requireKyc?: boolean;

  @ApiPropertyOptional({ description: '每日价格波动幅度，如 0.05 表示 ±5%' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyFluctuationPct?: number;

  @ApiPropertyOptional({ description: '成交溢价比例，0.1 表示最高溢价 10%' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dealPremiumPct?: number;
}

export class TradeRecordQueryDto extends NftListQueryDto {
  @ApiPropertyOptional({ enum: ['buy', 'sell', 'all'] })
  @IsOptional()
  @IsEnum(['buy', 'sell', 'all'] as const)
  type?: 'buy' | 'sell' | 'all';
}
