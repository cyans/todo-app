// @CODE:TODO-CRUD-001:MAIN
/**
 * Main Server Entry Point
 *
 * This file serves as the main entry point for the Todo CRUD API server.
 * It initializes database connection, creates Express app, and starts server.
 *
 * @module server
 * @version 1.0.0
 */

import dotenv from 'dotenv';
import createApp from './src/app.js';
import { connectDB } from './src/config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize and start server
let app;

async function startServer() {
  try {
    // Connect to database first
    await connectDB();

    // Create Express app using app.js configuration
    app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
