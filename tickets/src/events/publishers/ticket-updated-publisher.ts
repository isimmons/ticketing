import { Publisher, Subjects, TicketUpdatedEvent } from '@is-sg-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
