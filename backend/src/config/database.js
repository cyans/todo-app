// @CODE:TAG-DEPLOY-CONFIG-001
// Database configuration and connection management - DISABLED FOR MOCK API

// Mock database instance for compatibility - no actual MongoDB connection
class MockDatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    console.log('📊 Mock Database: Using in-memory data, no MongoDB connection');
    this.isConnected = true;
    return this.connection;
  }

  async disconnect() {
    console.log('📊 Mock Database: Disconnected');
    this.isConnected = false;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: 1, // Mock connected state
      host: 'mock-database',
      name: 'mock-todo-db',
    };
  }

  setupEventHandlers() {
    // No-op for mock database
  }

  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: this.getConnectionStatus(),
    };
  }

  async getStats() {
    return {
      collections: 1,
      documents: 5,
      dataSize: 1024,
      storageSize: 2048,
      indexes: 1,
      indexSize: 512,
    };
  }
}

// Create and export mock instance
const database = new MockDatabaseConnection();

export default database;