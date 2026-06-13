import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

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
