import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// error handling
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@is-sg-tickets/common';

// routes
import { createOrderRouter } from './routes/new';
import { indexOrderRouter } from './routes';
import { cancelOrderRouter } from './routes/cancel';
import { showOrderRouter } from './routes/show';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

// routes
app.use(cancelOrderRouter);
app.use(showOrderRouter);
app.use(createOrderRouter);
app.use(indexOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
