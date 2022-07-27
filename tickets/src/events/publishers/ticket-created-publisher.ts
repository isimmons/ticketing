import { Publisher, Subjects, TicketCreatedEvent } from '@is-sg-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
