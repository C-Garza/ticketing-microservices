import { Subjects, Publisher, ExpirationComplete } from "@cgatickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationComplete> {
  readonly subject = Subjects.ExpirationComplete;
};