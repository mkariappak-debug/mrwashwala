import dns from 'dns';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('\x1b[33mWarning: MONGO_URI is not set. Skipping MongoDB connection.\x1b[0m');
      console.warn('Add MONGO_URI to server/config/.env or server/.env to enable database features.');
      return;
    }

    if (process.env.MONGO_URI.startsWith('mongodb+srv://')) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[36m%s\x1b[0m`, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

export default connectDB;
