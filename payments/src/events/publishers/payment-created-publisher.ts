import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@is-sg-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
