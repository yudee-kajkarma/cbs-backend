import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongodb.uri) {
      throw new Error('MONGO_URI not set in environment');
    }
    await mongoose.connect(config.mongodb.uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};
