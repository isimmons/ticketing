import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { signup } from './helpers/signup-helper';
import { Ticket } from '../../models/ticket';

// TODO: extract ticket build helper (used in other tests/files)
const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('fetches the order if the user owns the order', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const userOne = signup();
  const userTwo = signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns a 404 if the user does not own the order', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const userOne = signup();
  const userTwo = signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(404);
});

it('returns a 400 if the order if the orderId is not valid', async () => {
  const user = signup();

  await request(app)
    .get(`/api/orders/foobar`)
    .set('Cookie', user)
    .send()
    .expect(400);
});

it('returns a 404 if the order if the order does not exist', async () => {
  const user = signup();
  const id = new mongoose.Types.ObjectId();

  await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', user)
    .send()
    .expect(404);
});
