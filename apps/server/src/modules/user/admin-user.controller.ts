import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminUserListQueryDto } from './dto';
import { UserService } from './user.service';

@ApiTags('Admin-User')
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '用户列表（后台）' })
  list(@Query() query: AdminUserListQueryDto) {
    return this.userService.adminListUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情（后台）' })
  detail(@Param('id') id: string) {
    return this.userService.adminGetUser(id);
  }
}
