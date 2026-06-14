import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class MessageListQueryDto {
  @ApiPropertyOptional({ enum: ['system', 'order', 'trade', 'all'] })
  @IsOptional()
  @IsEnum(['system', 'order', 'trade', 'all'] as const)
  type?: 'system' | 'order' | 'trade' | 'all';

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

export class BroadcastNotificationDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: ['system', 'order', 'trade'], default: 'system' })
  @IsOptional()
  @IsEnum(['system', 'order', 'trade'] as const)
  type?: 'system' | 'order' | 'trade';

  @ApiProperty({ enum: ['all', 'phones'] })
  @IsEnum(['all', 'phones'] as const)
  target!: 'all' | 'phones';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];
}
