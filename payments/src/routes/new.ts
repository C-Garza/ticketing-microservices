import express, {Request, Response} from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from "@cgatickets/common";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments", 
  requireAuth, 
  [
    body("token")
      .not()
      .isEmpty()
      .withMessage("Token required"),
    body("orderId")
      .not()
      .isEmpty()
      .withMessage("Order ID required")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {token, orderId} = req.body;
    const order = await Order.findById(orderId);

    if(!order) {
      throw new NotFoundError();
    }
    if(order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if(order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token
    });
    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    res.status(201).send({success: true});
  }
);

export {router as createChargeRouter};