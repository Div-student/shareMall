import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { AddCartDto, UpdateCartDto } from './dto';
import { CartService } from './cart.service';

@ApiTags('Product')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '购物车列表' })
  list(@CurrentUser('sub') userId: string) {
    return this.cartService.list(userId);
  }

  @Post()
  @ApiOperation({ summary: '加入购物车' })
  add(@CurrentUser('sub') userId: string, @Body() dto: AddCartDto) {
    return this.cartService.add(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新购物车数量' })
  update(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车项' })
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.cartService.remove(userId, id);
  }
}
