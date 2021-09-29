import express, {Request, Response} from "express";
import { body } from "express-validator";
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@cgatickets/common";
import { Ticket } from "../models/Ticket";
import { Order } from "../models/Order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// 15 MINUTES
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

// CREATES NEW ORDER FOR A TICKET
router.post("/api/orders", 
requireAuth, [
  body("ticketId")
    .not()
    .isEmpty()
    .isMongoId()
    .withMessage("TicketId must be provided")
],
validateRequest,
async (req: Request, res: Response) => {
  const {ticketId} = req.body;
  // Find the ticket the user is trying to order in the database
  const ticket = await Ticket.findById(ticketId);
  if(!ticket) {
    throw new NotFoundError();
  }
  // Make sure ticket is not already reserved
  const isReserved = await ticket.isReserved();
  if(isReserved) {
    throw new BadRequestError("Ticket is already reserved");
  }

  // Calculate an expiration date for order
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build the order and save to database
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  // Publish an event saying order was created
  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  });
  res.status(201).send(order);
});

export {router as newOrderRouter};