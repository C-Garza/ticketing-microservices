import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import { TicketCreatedEvent } from "@cgatickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  // Create a listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "Concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  // Create a fake message obj

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it("creates and saves a ticket", async () => {
  const {listener, data, msg} = await setup();
  // Call the onMessgae function with params
  await listener.onMessage(data, msg);
  // Write assertiions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const {listener, data, msg} = await setup();
  await listener.onMessage(data, msg);
  
  expect(msg.ack).toHaveBeenCalled();
});