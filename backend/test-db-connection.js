// Simple MongoDB connection test
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas connection...');
console.log('URI:', uri ? 'Provided' : 'Missing');

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');

    const startTime = Date.now();
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 5000, // Reduced timeout for quicker testing
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connected successfully in ${connectionTime}ms`);

    // Test a simple operation
    console.log('🧪 Testing database operations...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections`);

    // Test todos collection specifically
    const todosCount = await db.collection('todos').countDocuments();
    console.log(`📝 Todos collection has ${todosCount} documents`);

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  }
}

testConnection();