import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// routers
import { createChargeRouter } from './routes/new';

// error handling
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@is-sg-tickets/common';

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

// routers
app.use(createChargeRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// error handler
app.use(errorHandler);

export { app };
