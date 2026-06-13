import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  skuId!: number;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class OrderPreviewDto {
  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  addressId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useFund?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fundAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  couponId?: number;
}

export class CreateOrderDto extends OrderPreviewDto {}

export class OrderListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'unpaid', 'paid', 'shipped', 'received', 'completed', 'aftersale'] })
  @IsOptional()
  @IsEnum(['all', 'unpaid', 'paid', 'shipped', 'received', 'completed', 'aftersale'] as const)
  status?: 'all' | 'unpaid' | 'paid' | 'shipped' | 'received' | 'completed' | 'aftersale';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

export class PayOrderDto {
  @ApiPropertyOptional({ enum: ['wechat', 'alipay'] })
  @IsOptional()
  @IsEnum(['wechat', 'alipay'] as const)
  channel?: 'wechat' | 'alipay';
}

export class AddCartDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  productId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skuId?: number;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AdminOrderListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'unpaid', 'paid', 'shipped', 'received', 'completed', 'closed'] })
  @IsOptional()
  @IsEnum(['all', 'unpaid', 'paid', 'shipped', 'received', 'completed', 'closed'] as const)
  status?: 'all' | 'unpaid' | 'paid' | 'shipped' | 'received' | 'completed' | 'closed';

  @ApiPropertyOptional({ description: '订单号模糊搜索' })
  @IsOptional()
  orderNo?: string;

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
