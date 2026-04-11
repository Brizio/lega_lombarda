import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(env.MONGO_URI);
      console.log('MongoDB connected:', env.MONGO_URI);
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, err);
      if (retries >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * retries));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
