import { Publisher, Subjects, TicketUpdatedEvent } from "@cgatickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
};