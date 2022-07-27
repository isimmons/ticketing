import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@is-sg-tickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .isMongoId()
      .withMessage('Valid order ID must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) {
      // TODO: add in logging system
      // logging system for admin only
      // log user and unauthorized access attempt
      // return NotFoundError for end user

      throw new NotFoundError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
