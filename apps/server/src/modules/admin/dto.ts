import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AdminRoleSaveDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];

  @IsOptional()
  @IsString()
  dataScope?: string;
}

export class AdminAccountCreateDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  roleId!: string;
}

export class AdminAccountUpdateDto {
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsEnum(['enabled', 'disabled'])
  status?: 'enabled' | 'disabled';

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class OperationLogQueryDto {
  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
