import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wrapper');

// in real world put this in a env var on server/computer
process.env.STRIPE_KEY =
  'sk_test_51LO0hoE9tL4tefdgPwNO4ESKbPD9gNHWFNwJCzfSaphqbvmm82lUjzOLDVMWVud1SdNSxtK0amHZS6gcN5EEKGRy00asQ5O868';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'foobar';
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});
