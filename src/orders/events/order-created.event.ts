export const ORDERS_QUEUE = 'orders';
export const ORDER_CREATED = 'order-created';

export interface OrderCreatedEvent {
  orderId: string;
  customerEmail: string;
  total: number;
}
