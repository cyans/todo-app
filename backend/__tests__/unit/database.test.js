// @TEST:TODO-CRUD-001:DATA
/**
 * Unit Tests for MongoDB Database Connection
 *
 * Test Coverage:
 * - Database connection establishment
 * - Database disconnection
 * - Connection error handling
 * - Connection state validation
 *
 * @phase RED - Writing failing tests first
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/database.js';

describe('Database Connection', () => {
  let mongoServer;

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
  });

  afterAll(async () => {
    // Clean up MongoDB instance
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    // Disconnect after each test
    await disconnectDB();
  });

  describe('connectDB', () => {
    it('should successfully connect to MongoDB', async () => {
      const uri = mongoServer.getUri();
      await connectDB(uri);

      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    it('should handle connection errors gracefully', async () => {
      const invalidUri = 'mongodb://invalid:27017/test';

      await expect(connectDB(invalidUri)).rejects.toThrow();
    });

    it('should not connect twice if already connected', async () => {
      const uri = mongoServer.getUri();

      await connectDB(uri);
      const firstConnection = mongoose.connection;

      await connectDB(uri);
      const secondConnection = mongoose.connection;

      expect(firstConnection).toBe(secondConnection);
      expect(mongoose.connection.readyState).toBe(1);
    });
  });

  describe('disconnectDB', () => {
    it('should successfully disconnect from MongoDB', async () => {
      const uri = mongoServer.getUri();
      await connectDB(uri);

      expect(mongoose.connection.readyState).toBe(1);

      await disconnectDB();

      expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
    });

    it('should handle disconnect when not connected', async () => {
      // Should not throw error even if not connected
      await expect(disconnectDB()).resolves.not.toThrow();
    });
  });
});
