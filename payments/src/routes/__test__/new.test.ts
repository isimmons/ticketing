import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { signup } from '../../test/helpers/signup-helper';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { OrderStatus } from '@is-sg-tickets/common';
import { stripe } from '../../stripe';

//jest.setTimeout(60000);

it('Should throw 404 if order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: 'foobartoken',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Should throw 401 if order does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: 'foobartoken',
      orderId: order.id,
    })
    .expect(401);
});

it('Should throw 400 if order has been cancelled', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup(userId))
    .send({
      token: 'foobartoken',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 when given valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const { data } = await stripe.charges.list({ limit: 50 });
  const charge = data.find((c) => {
    return c.amount === price * 100;
  });

  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge!.id,
  });

  expect(payment).not.toBeNull();
});
