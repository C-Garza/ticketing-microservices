import express, {Request, Response} from "express";
import mongoose from "mongoose";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@cgatickets/common";
import { Order, OrderStatus } from "../models/Order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  if(!mongoose.isValidObjectId(req.params.orderId)) {
    throw new NotFoundError();
  }
  const {orderId} = req.params;
  const order = await Order.findById(orderId).populate("ticket");
  
  if(!order) {
    throw new NotFoundError();
  }
  if(order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  order.status = OrderStatus.Cancelled;
  await order.save();

  // publishing event saying this was canceled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price
    }
  });
  res.status(204).send(order);
});

export {router as deleteOrderRouter};