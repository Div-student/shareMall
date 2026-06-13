import { Body, Controller, Get, Ip, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminRoleSaveDto } from './dto';
import { RoleService } from './role.service';

@ApiTags('Admin-Role')
@ApiBearerAuth()
@Controller('admin/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '角色列表' })
  list() {
    return this.roleService.list();
  }

  @Post()
  @ApiOperation({ summary: '新增角色' })
  create(
    @Body() dto: AdminRoleSaveDto,
    @CurrentAdmin('sub') adminId: string,
    @Ip() ip: string,
  ) {
    return this.roleService.create(dto, adminId, ip);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  update(
    @Param('id') id: string,
    @Body() dto: AdminRoleSaveDto,
    @CurrentAdmin('sub') adminId: string,
    @Ip() ip: string,
  ) {
    return this.roleService.update(id, dto, adminId, ip);
  }
}
