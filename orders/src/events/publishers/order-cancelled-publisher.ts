import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from '@is-sg-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
