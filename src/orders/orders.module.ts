import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderCreatedHandler } from './order-created.handler';
import { ORDERS_QUEUE } from './events/order-created.event';

@Module({
  imports: [BullModule.registerQueue({ name: ORDERS_QUEUE })],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderCreatedHandler],
})
export class OrdersModule {}
