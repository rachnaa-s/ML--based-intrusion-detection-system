import mongoose from 'mongoose';

let isDbConnected = false;

export async function connectDB(customUri) {
  if (process.env.SKIP_MONGO === 'true') {
    console.log('[MongoDB] SKIP_MONGO is true. Operating in memory store mode.');
    return;
  }

  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ids_db';

  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`[MongoDB] Connecting to database at: ${maskedUri}...`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });

    isDbConnected = true;
    console.log(`[MongoDB] Successfully connected to database: "${mongoose.connection.name}"`);
  } catch (err) {
    isDbConnected = false;
    console.warn(`[MongoDB] Connection notice: Could not connect to MongoDB (${err.message}).`);
    console.warn(`[MongoDB] Operating with graceful in-memory storage for history & blocked IPs until MongoDB is connected.`);
    console.warn(`[MongoDB] To connect to MongoDB Atlas, add your MONGODB_URI in backend/.env`);
  }

  mongoose.connection.on('connected', () => {
    isDbConnected = true;
    console.log('[MongoDB] Connection established.');
  });

  mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
    console.warn('[MongoDB] Connection lost. Running in fallback mode.');
  });

  mongoose.connection.on('error', (err) => {
    isDbConnected = false;
  });
}

export function isConnected() {
  return isDbConnected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  return {
    connected: isConnected(),
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || 'ids_db',
    host: mongoose.connection.host || 'localhost'
  };
}
