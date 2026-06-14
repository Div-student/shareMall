import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FinanceFlowQueryDto {
  @ApiPropertyOptional({ enum: ['payment', 'withdraw', 'fund', 'nft'], default: 'fund' })
  @IsOptional()
  @IsEnum(['payment', 'withdraw', 'fund', 'nft'] as const)
  category?: 'payment' | 'withdraw' | 'fund' | 'nft';

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

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

export class FinanceReportQueryDto {
  @ApiPropertyOptional({ enum: ['trade', 'fund', 'withdraw', 'nft'], default: 'trade' })
  @IsOptional()
  @IsEnum(['trade', 'fund', 'withdraw', 'nft'] as const)
  type?: 'trade' | 'fund' | 'withdraw' | 'nft';

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class FinanceReconcileQueryDto {
  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
