import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SmsConfigService } from '../../common/sms/sms-config.service';

export class SmsConfigSaveDto {
  @IsOptional()
  @IsEnum(['mock', 'aliyun', 'tencent'] as const)
  provider?: 'mock' | 'aliyun' | 'tencent';

  @IsOptional()
  @IsString()
  signName?: string;

  @IsOptional()
  @IsString()
  templateCode?: string;

  @IsOptional()
  @IsString()
  accessKey?: string;

  @IsOptional()
  @IsString()
  accessSecret?: string;

  @IsOptional()
  @IsString()
  devCode?: string;
}

@ApiTags('Admin-SMS')
@Controller('admin/sms')
export class AdminSmsController {
  constructor(private readonly smsConfig: SmsConfigService) {}

  @Get('config')
  @ApiOperation({ summary: '短信配置' })
  getConfig() {
    return this.smsConfig.getConfigForAdmin();
  }

  @Put('config')
  @ApiOperation({ summary: '保存短信配置' })
  saveConfig(@Body() dto: SmsConfigSaveDto) {
    return this.smsConfig.saveConfig(dto);
  }
}
