import { Publisher, OrderCreatedEvent, Subjects } from "@cgatickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
};