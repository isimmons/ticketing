import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@is-sg-tickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  const msg: Pick<Message, 'ack'> = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('updates the order status', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const order = await Order.findById(data.id);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('acknowleges the msg', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});
