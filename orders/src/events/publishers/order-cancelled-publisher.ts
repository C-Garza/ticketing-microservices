import { Publisher, OrderCancelledEvent, Subjects } from "@cgatickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
};