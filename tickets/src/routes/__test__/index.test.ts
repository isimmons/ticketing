import request from 'supertest';
import { app } from '../../app';
import { signup } from './helpers/signup-helper';

const createTicket = () => {
  const title = 'foo';
  const price = 20;

  return request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title,
      price,
    })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
