import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
} from '@is-sg-tickets/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch(
  '/api/orders/:orderId/cancel',
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
      //TODO: same as in show, log but send client 404
      throw new NotFoundError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.send(order);
  }
);

export { router as cancelOrderRouter };
