import { Publisher, Subjects, OrderCreatedEvent } from '@is-sg-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
