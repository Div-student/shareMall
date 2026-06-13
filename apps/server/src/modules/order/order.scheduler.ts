import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderService } from './order.service';

/** 定时扫描超时未确认收货的订单（每小时一次） */
@Injectable()
export class OrderScheduler implements OnModuleInit {
  constructor(private readonly orderService: OrderService) {}

  onModuleInit() {
    void this.orderService.autoReceiveExpiredOrders();
    setInterval(() => void this.orderService.autoReceiveExpiredOrders(), 60 * 60 * 1000);
  }
}
