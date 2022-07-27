import request from 'supertest';
import { app } from '../../app';
import { signup } from './helpers/signup-helper';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '../../models/order';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('cancels the order if the user owns the order', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const user = signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: cancelledOrder } = await request(app)
    .patch(`/api/orders/${order.id}/cancel`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
});

it('Should emit an event, order:cancelled', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const user = signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: cancelledOrder } = await request(app)
    .patch(`/api/orders/${order.id}/cancel`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
