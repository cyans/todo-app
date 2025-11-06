// @CODE:TODO-CRUD-001:CONFIG:DB
/**
 * MongoDB Database Connection Configuration
 *
 * Provides:
 * - Database connection establishment
 * - Connection pooling configuration
 * - Error handling for connection issues
 * - Graceful disconnection
 *
 * @module config/database
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 *
 * @param {string} uri - MongoDB connection URI (optional, defaults to env var)
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If connection fails
 */
export async function connectDB(uri = process.env.MONGODB_URI) {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose;
    }

    // Connect to MongoDB
    await mongoose.connect(uri, {
      // Connection pool settings - optimized for Atlas
      maxPoolSize: 5,
      minPoolSize: 1,
      socketTimeoutMS: 45000, // Increased for better stability
      serverSelectionTimeoutMS: 30000, // Increased for Atlas
      connectTimeoutMS: 30000, // Increased for slower connections
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 30000,
    });

    console.log('MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 *
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    }
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
