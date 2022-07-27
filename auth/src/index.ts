import { app } from './app';
import mongoose from 'mongoose';

const start = async () => {
  console.log('Starting up...');

  if (!process.env.JWT_KEY) throw new Error('Unable to verify key');
  if (!process.env.MONGO_URI)
    throw new Error('Unable to get correct db connection string');

  try {
    const url = process.env.MONGO_URI;

    await mongoose.connect(url);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }

  // listener
  const port = 3000;
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}!!`);
  });
};

start();
