import { Ticket } from "../Ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instnace of a ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 5,
    userId: "123"
  });

  // Save ticket to database
  await ticket.save();

  // Fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets
  firstInstance!.set({price: 10});
  secondInstance!.set({price: 15});

  // Save the first fetched ticket
  await firstInstance!.save();

  // Save the second fetched ticket and expect an error
  await expect(secondInstance!.save()).rejects.toThrow();
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "123"
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});