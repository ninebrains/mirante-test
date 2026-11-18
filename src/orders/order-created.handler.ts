import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';
import { ORDERS_QUEUE, OrderCreatedEvent } from './events/order-created.event';

@Processor(ORDERS_QUEUE)
export class OrderCreatedHandler extends WorkerHost {
  constructor(private readonly mailer: MailerService) {
    super();
  }

  async process(job: Job<OrderCreatedEvent>): Promise<void> {
    const { orderId, customerEmail, total } = job.data;
    await this.mailer.sendMail({
      to: customerEmail,
      subject: `Order #${orderId} confirmed`,
      text: `We received your order. Total: $${total.toFixed(2)}`,
    });
  }
}
