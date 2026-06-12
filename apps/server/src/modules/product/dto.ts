import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ProductListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: ['default', 'price_asc', 'price_desc', 'sales'] })
  @IsOptional()
  @IsEnum(['default', 'price_asc', 'price_desc', 'sales'] as const)
  sort?: 'default' | 'price_asc' | 'price_desc' | 'sales';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class AdminProductListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: ['on_sale', 'off_shelf'] })
  @IsOptional()
  @IsEnum(['on_sale', 'off_shelf'] as const)
  status?: 'on_sale' | 'off_shelf';

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

export class AdminCreateProductDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @ApiProperty()
  @IsString()
  mainImage!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailHtml?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marketPrice?: number;

  @ApiPropertyOptional({ description: '贡献金比例，如 0.1 表示 10%' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fundRatio?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowFundDeduct?: boolean;

  @ApiPropertyOptional({ enum: ['on_sale', 'off_shelf'], default: 'off_shelf' })
  @IsOptional()
  @IsEnum(['on_sale', 'off_shelf'] as const)
  status?: 'on_sale' | 'off_shelf';

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}

export class AdminUpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailHtml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marketPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fundRatio?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowFundDeduct?: boolean;

  @ApiPropertyOptional({ enum: ['on_sale', 'off_shelf'] })
  @IsOptional()
  @IsEnum(['on_sale', 'off_shelf'] as const)
  status?: 'on_sale' | 'off_shelf';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}

export class AdminCreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fundRatio?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}
