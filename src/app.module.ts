import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL }),
    MailerModule.forRoot({ transport: process.env.SMTP_URL }),
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    OrdersModule,
  ],
})
export class AppModule {}
