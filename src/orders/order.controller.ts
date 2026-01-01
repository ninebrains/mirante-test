import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';

// Everything in the controller: business rules, SQL and synchronous email.
@Controller('orders')
export class OrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailer: MailerService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const total = this.calculateTotal(dto.items, dto.couponCode);

    const [order] = await this.dataSource.query(
      'INSERT INTO orders (customer_email, total, status) VALUES ($1, $2, $3) RETURNING id, total, status',
      [dto.customerEmail, total, 'created'],
    );

    for (const item of dto.items) {
      await this.dataSource.query(
        'INSERT INTO order_items (order_id, sku, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.sku, item.quantity, item.unitPrice],
      );
    }

    // The client waits for SMTP to answer before getting the 201.
    await this.mailer.sendMail({
      to: dto.customerEmail,
      subject: `Order #${order.id} confirmed`,
      text: `We received your order. Total: $${total.toFixed(2)}`,
    });

    return order;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const rows = await this.dataSource.query(
      'SELECT id, customer_email, total, status FROM orders WHERE id = $1',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return rows[0];
  }

  private calculateTotal(items: OrderItemDto[], couponCode?: string): number {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }
    if (couponCode === 'WELCOME10') {
      subtotal = subtotal * 0.9;
    }
    return Math.round(subtotal * 100) / 100;
  }
}
