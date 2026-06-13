import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class ApplyAftersaleDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  orderId!: number;

  @ApiProperty({ enum: ['refund_only', 'return_refund'] })
  @IsEnum(['refund_only', 'return_refund'] as const)
  type!: 'refund_only' | 'return_refund';

  @ApiProperty()
  @IsString()
  @Length(2, 255)
  reason!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];
}

export class AftersaleListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'pending', 'refunded', 'rejected'], default: 'all' })
  @IsOptional()
  @IsEnum(['all', 'pending', 'refunded', 'rejected'] as const)
  status?: 'all' | 'pending' | 'refunded' | 'rejected';

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

export class AdminAftersaleAuditDto {
  @ApiProperty({ enum: ['pass', 'reject'] })
  @IsEnum(['pass', 'reject'] as const)
  action!: 'pass' | 'reject';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  reason?: string;
}
