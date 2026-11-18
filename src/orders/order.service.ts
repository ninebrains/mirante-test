import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { OrderRepository } from './order.repository';
import { ORDER_CREATED, ORDERS_QUEUE, OrderCreatedEvent } from './events/order-created.event';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @InjectQueue(ORDERS_QUEUE) private readonly ordersQueue: Queue,
  ) {}

  async create(dto: CreateOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const total = this.calculateTotal(dto.items, dto.couponCode);
    const order = await this.orderRepository.insert(dto.customerEmail, total, dto.items);

    // The email now goes out in the background: the client does not wait for SMTP.
    const event: OrderCreatedEvent = {
      orderId: order.id,
      customerEmail: dto.customerEmail,
      total,
    };
    await this.ordersQueue.add(ORDER_CREATED, event);

    return order;
  }

  async findById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  // Moved from OrderController. Only formatting, a comment and the local
  // variable name changed — the logic is identical (stage 4 answer key).
  private calculateTotal(items: OrderItemDto[], couponCode?: string): number {
    let sum = 0;
    for (const item of items) { sum += item.quantity * item.unitPrice; }
    if (couponCode === 'WELCOME10') {
      sum = sum * 0.9; // 10% discount
    }
    return Math.round(sum * 100) / 100;
  }
}
