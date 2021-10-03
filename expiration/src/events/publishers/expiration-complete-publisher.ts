import { Subjects, Publisher, ExpirationCompleteEvent } from "@cgatickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
};