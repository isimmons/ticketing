import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@is-sg-tickets/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'The Big Show',
    price: 5000,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg: Pick<Message, 'ack'> = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds a ticket, updates the ticket, and saves the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg as Message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acknowleges the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});

it('fails to acknowlege the event if version is out of order', async () => {
  const { listener, data, msg } = await setup();

  data.version = data.version + 10;

  await expect(listener.onMessage(data, msg as Message)).rejects.toThrow(
    'Ticket not found'
  );
  expect(msg.ack).not.toHaveBeenCalled();
});
