import { useEffect, useState, useRef } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import buildClient from '../../api/build-client';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef(null);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    data: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();

    intervalRef.timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(intervalRef.timerId);
    };
  }, [order]);

  if (timeLeft <= 0) {
    clearInterval(intervalRef.timerId);
    return <div>Order Expired {timeLeft}</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51LO0hoE9tL4tefdgHT4O7nLvEC43UiQSTpwY97l3GFGY2bxZIQbkwRes2umFbWrXoxjzl8n09slmVW6ApxjrkjRG00wPD8ainQ"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

export async function getServerSideProps(context) {
  const client = buildClient(context);
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { props: { order: data } };
}

export default OrderShow;
