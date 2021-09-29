import express, {Request, Response} from "express";
import mongoose from "mongoose";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@cgatickets/common";
import { Order } from "../models/Order";

const router = express.Router();

router.get("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  if(!mongoose.isValidObjectId(req.params.orderId)) {
    throw new NotFoundError();
  }
  const order = await Order.findById(req.params.orderId).populate("ticket");

  if(!order) {
    throw new NotFoundError();
  }
  if(order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
});

export {router as showOrderRouter};