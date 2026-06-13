import { Body, Controller, Get, Ip, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAccountService } from './admin-account.service';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminAccountCreateDto, AdminAccountUpdateDto } from './dto';

@ApiTags('Admin-Account')
@ApiBearerAuth()
@Controller('admin/accounts')
export class AdminAccountController {
  constructor(private readonly accountService: AdminAccountService) {}

  @Get()
  @ApiOperation({ summary: '管理员账号列表' })
  list() {
    return this.accountService.list();
  }

  @Post()
  @ApiOperation({ summary: '新增管理员账号' })
  create(
    @Body() dto: AdminAccountCreateDto,
    @CurrentAdmin('sub') adminId: string,
    @Ip() ip: string,
  ) {
    return this.accountService.create(dto, adminId, ip);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新管理员账号' })
  update(
    @Param('id') id: string,
    @Body() dto: AdminAccountUpdateDto,
    @CurrentAdmin('sub') adminId: string,
    @Ip() ip: string,
  ) {
    return this.accountService.update(id, dto, adminId, ip);
  }
}
