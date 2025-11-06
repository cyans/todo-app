// Deep MongoDB Atlas diagnostic
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('🔍 Deep MongoDB Atlas Diagnostic');
console.log('================================');

async function deepDiagnostic() {
  try {
    console.log('⏳ Testing basic connection...');

    const startTime = Date.now();

    // Test with more detailed options
    await mongoose.connect(uri, {
      maxPoolSize: 1, // Minimal pool for testing
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    const connectionTime = Date.now() - startTime;
    console.log(`✅ Basic connection: ${connectionTime}ms`);

    // Test connection details
    console.log('🔍 Connection details:');
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Port: ${mongoose.connection.port}`);
    console.log(`- Name: ${mongoose.connection.name}`);
    console.log(`- ReadyState: ${mongoose.connection.readyState} (1=connected)`);

    // Test simple ping
    console.log('🏓 Testing ping...');
    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStart;
    console.log(`✅ Ping successful: ${pingTime}ms`);

    // Test list collections with timeout
    console.log('📁 Testing collection access...');
    const listStart = Date.now();

    // Add manual timeout for collection listing
    const collectionsPromise = mongoose.connection.db.listCollections().toArray();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Collection listing timeout')), 15000)
    );

    const collections = await Promise.race([collectionsPromise, timeoutPromise]);
    const listTime = Date.now() - listStart;
    console.log(`✅ Collections listed: ${listTime}ms, found: ${collections.length}`);

    // Test todos collection specifically
    console.log('📝 Testing todos collection access...');
    const todosStart = Date.now();

    const todosCountPromise = mongoose.connection.db.collection('todos').countDocuments();
    const todosTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Todos count timeout')), 15000)
    );

    const todosCount = await Promise.race([todosCountPromise, todosTimeoutPromise]);
    const todosTime = Date.now() - todosStart;
    console.log(`✅ Todos count: ${todosTime}ms, count: ${todosCount}`);

    // Test simple insert
    console.log('➕ Testing simple insert...');
    const insertStart = Date.now();

    const testDoc = {
      title: 'Test Document',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertPromise = mongoose.connection.db.collection('todos').insertOne(testDoc);
    const insertTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Insert timeout')), 15000)
    );

    const insertResult = await Promise.race([insertPromise, insertTimeoutPromise]);
    const insertTime = Date.now() - insertStart;
    console.log(`✅ Insert successful: ${insertTime}ms, ID: ${insertResult.insertedId}`);

    // Test simple find
    console.log('🔍 Testing simple find...');
    const findStart = Date.now();

    const findPromise = mongoose.connection.db.collection('todos').findOne({_id: insertResult.insertedId});
    const findTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Find timeout')), 15000)
    );

    const foundDoc = await Promise.race([findPromise, findTimeoutPromise]);
    const findTime = Date.now() - findStart;
    console.log(`✅ Find successful: ${findTime}ms, title: ${foundDoc.title}`);

    // Cleanup test document
    console.log('🗑️ Cleaning up test document...');
    await mongoose.connection.db.collection('todos').deleteOne({_id: insertResult.insertedId});
    console.log('✅ Cleanup complete');

    console.log('🎉 All tests passed! MongoDB Atlas connection is working correctly.');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    console.error('Stack:', error.stack);

    // Additional error analysis
    if (error.message.includes('timeout')) {
      console.error('⏰ Timeout detected - this suggests network connectivity issues');
      console.error('💡 Solutions:');
      console.error('   1. Check if your IP is whitelisted in MongoDB Atlas');
      console.error('   2. Try a different Atlas region');
      console.error('   3. Check network connectivity/firewall');
      console.error('   4. Consider using a local MongoDB for development');
    } else if (error.message.includes('authentication')) {
      console.error('🔐 Authentication failed - check username/password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Network/DNS resolution failed');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  }
}

deepDiagnostic();