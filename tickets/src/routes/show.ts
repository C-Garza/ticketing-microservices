import express, {Request, Response} from "express";
import { NotFoundError } from "@cgatickets/common";
import { Ticket } from "../models/Ticket";
import mongoose from "mongoose";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  if(!mongoose.isValidObjectId(req.params.id)) {
    throw new NotFoundError();
  }

  const ticket = await Ticket.findById(req.params.id);

  if(!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export {router as showTicketRouter};