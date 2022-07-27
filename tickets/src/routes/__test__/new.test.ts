import request from 'supertest';
import { app } from '../../app';
import { signup } from './helpers/signup-helper';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('has a route handler for /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).toEqual(401);
});
it('returns an error other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({ title: '', price: 10 })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({ price: 10 })
    .expect(400);
});
it('returns an error if invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({ title: 'foobar', price: -10 })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({ title: 'foobar' })
    .expect(400);
});
it('creates a ticket with valid inputs', async () => {
  const title = 'foobar';
  const price = 20;
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: title,
      price: price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
  expect(tickets[0].title).toEqual(title);
});

it('Publishes an event', async () => {
  const title = 'foobar';
  const price = 20;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: title,
      price: price,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
