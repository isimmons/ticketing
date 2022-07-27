import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@is-sg-tickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  const msg: Pick<Message, 'ack'> = {
    ack: jest.fn(),
  };

  return { listener, ticket, orderId, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acknowleges the msg', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});

it('fails if ticket not found', async () => {
  const { listener, data, msg } = await setup();
  const badId = new mongoose.Types.ObjectId().toHexString();

  data.ticket.id = badId;

  await expect(listener.onMessage(data, msg as Message)).rejects.toThrow(
    'Ticket not found'
  );

  expect(msg.ack).not.toHaveBeenCalled();
});

it('publishes a ticket cancelled event', async () => {
  const { listener, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.orderId).not.toBeDefined();
});
