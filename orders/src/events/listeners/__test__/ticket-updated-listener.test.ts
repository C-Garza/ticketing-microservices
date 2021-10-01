import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import { TicketUpdatedEvent } from "@cgatickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 20
  });
  await ticket.save();

  // Create a fake data obj
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "New Concert",
    price: 999,
    userId: "Test"
  };
  // Create a fake msg obj

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  // Return objs
  return {msg, data, ticket, listener};
};

it("finds, updates, and saves a ticket", async () => {
  const {msg, data, ticket, listener} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const {msg, data, listener} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const {msg, data, listener, ticket} = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});