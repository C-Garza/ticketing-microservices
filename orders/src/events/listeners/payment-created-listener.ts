import { Listener, Subjects, PaymentCreatedEvent, OrderStatus } from "@cgatickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/Order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    
    if(!order) {
      throw new Error("Order not found");
    }
    order.set({
      status: OrderStatus.Complete
    });
    await order.save();
    // PUBLISH UPDATE ORDER EVENT FOR VERSION ISSUES

    msg.ack();
  }
};