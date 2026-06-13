import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  receiver!: string;

  @ApiProperty()
  @IsString()
  @Length(11, 20)
  phone!: string;

  @ApiProperty()
  @IsString()
  province!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsString()
  district!: string;

  @ApiProperty()
  @IsString()
  detail!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class SubmitKycDto {
  @ApiProperty({ example: '张三' })
  @IsString()
  @Length(2, 20)
  realName!: string;

  @ApiProperty({ example: '110101199001011234' })
  @IsString()
  @Length(18, 18)
  idCardNo!: string;
}

export class AdminKycListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'pending', 'passed', 'rejected'], default: 'pending' })
  @IsOptional()
  @IsEnum(['all', 'pending', 'passed', 'rejected'] as const)
  status?: 'all' | 'pending' | 'passed' | 'rejected';

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

export class AdminKycAuditDto {
  @ApiProperty({ enum: ['pass', 'reject'] })
  @IsEnum(['pass', 'reject'] as const)
  action!: 'pass' | 'reject';

  @ApiPropertyOptional({ description: '驳回原因' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  reason?: string;
}
