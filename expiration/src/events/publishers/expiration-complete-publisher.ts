import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@is-sg-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
