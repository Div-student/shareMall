import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class ApplyWithdrawDto {
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: ['bank', 'wechat', 'alipay'] })
  @IsEnum(['bank', 'wechat', 'alipay'] as const)
  method!: 'bank' | 'wechat' | 'alipay';

  @ApiProperty({ description: '收款账户信息' })
  @IsObject()
  accountInfo!: Record<string, string>;
}

export class WithdrawRecordQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'pending', 'paid', 'rejected'] })
  @IsOptional()
  @IsEnum(['all', 'pending', 'paid', 'rejected'] as const)
  status?: 'all' | 'pending' | 'paid' | 'rejected';

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

export class AdminWithdrawListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'pending', 'paid', 'rejected'], default: 'pending' })
  @IsOptional()
  @IsEnum(['all', 'pending', 'paid', 'rejected'] as const)
  status?: 'all' | 'pending' | 'paid' | 'rejected';

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

export class AdminWithdrawAuditDto {
  @ApiProperty({ enum: ['pass', 'reject'] })
  @IsEnum(['pass', 'reject'] as const)
  action!: 'pass' | 'reject';

  @ApiPropertyOptional({ description: '驳回原因' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  reason?: string;
}
