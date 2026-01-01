export class OrderItemDto {
  sku!: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreateOrderDto {
  customerEmail!: string;
  couponCode?: string;
  items!: OrderItemDto[];
}
