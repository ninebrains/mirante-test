import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderItemDto } from './dto/create-order.dto';

export interface OrderRow {
  id: string;
  customer_email: string;
  total: number;
  status: string;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly dataSource: DataSource) {}

  async insert(customerEmail: string, total: number, items: OrderItemDto[]): Promise<OrderRow> {
    return this.dataSource.transaction(async (manager) => {
      const [order] = await manager.query(
        'INSERT INTO orders (customer_email, total, status) VALUES ($1, $2, $3) RETURNING id, customer_email, total, status',
        [customerEmail, total, 'created'],
      );
      for (const item of items) {
        await manager.query(
          'INSERT INTO order_items (order_id, sku, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [order.id, item.sku, item.quantity, item.unitPrice],
        );
      }
      return order;
    });
  }

  async findById(id: string): Promise<OrderRow | undefined> {
    const rows = await this.dataSource.query(
      'SELECT id, customer_email, total, status FROM orders WHERE id = $1',
      [id],
    );
    return rows[0];
  }
}
