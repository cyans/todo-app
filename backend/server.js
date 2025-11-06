import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to database (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'To-Do Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import todoRoutes from './src/routes/todo-routes.js';

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to To-Do List API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/v1/todos', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
