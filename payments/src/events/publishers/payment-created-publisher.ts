import { Subjects, Publisher, PaymentCreatedEvent } from "@cgatickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
};