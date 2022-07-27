import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@is-sg-tickets/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg: Pick<Message, 'ack'> = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket).not.toBeNull();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acknowleges the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const ticket = await Ticket.findById(data.id);

  expect(msg.ack).toHaveBeenCalled();
});
