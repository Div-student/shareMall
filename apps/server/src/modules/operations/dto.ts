import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class AdminCouponSaveDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  name!: string;

  @ApiProperty({ enum: ['fixed', 'discount'] })
  @IsEnum(['fixed', 'discount'] as const)
  type!: 'fixed' | 'discount';

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  total?: number;

  @ApiPropertyOptional({ enum: ['enabled', 'disabled'] })
  @IsOptional()
  @IsEnum(['enabled', 'disabled'] as const)
  status?: 'enabled' | 'disabled';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endAt?: string;
}

export class AdminCampaignSaveDto {
  @ApiProperty()
  @IsString()
  @Length(1, 128)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ['promotion', 'discount', 'nft', 'general'] })
  @IsOptional()
  @IsEnum(['promotion', 'discount', 'nft', 'general'] as const)
  type?: 'promotion' | 'discount' | 'nft' | 'general';

  @ApiPropertyOptional()
  @IsOptional()
  rule?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'ended'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'ended'] as const)
  status?: 'draft' | 'active' | 'ended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endAt?: string;
}

export class AdminDictSaveDto {
  @ApiProperty()
  @IsString()
  @Length(1, 40)
  group!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 40)
  code!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  label!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ enum: ['enabled', 'disabled'] })
  @IsOptional()
  @IsEnum(['enabled', 'disabled'] as const)
  status?: 'enabled' | 'disabled';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string;
}

export class FaqItemDto {
  @ApiProperty()
  @IsString()
  question!: string;

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}

export class ServiceConfigSaveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wechat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onlineUrl?: string;

  @ApiPropertyOptional({ type: [FaqItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faq?: FaqItemDto[];
}

export class AdminListQueryDto {
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

export class AdminDictListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;
}
