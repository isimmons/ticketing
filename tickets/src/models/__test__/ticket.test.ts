import { Ticket } from '../ticket';

it('throws if try to save with out of sync version number', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: 'foobar',
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  await expect(secondInstance!.save()).rejects.toThrow();
});

it('updates version on model.save()', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: 'foobar',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  await ticket.save();
  expect(ticket.version).toEqual(3);
});
