// @CODE:TODO-BACKEND-001 - Todo Backend Main Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import API routes AFTER dotenv config
import todoRoutes from './src/routes/todo-routes.js';
// import workingTodoRoutes from './src/routes/working-todos.js'; // Legacy backup route

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
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

// Readiness probe endpoint
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    message: 'Service is ready to accept traffic',
    timestamp: new Date().toISOString()
  });
});

// Liveness probe endpoint
app.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString()
  });
});

// Startup probe endpoint
app.get('/startup', (req, res) => {
  res.status(200).json({
    status: 'started',
    message: 'Service has finished starting up',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to To-Do List API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/todos/health',
      create: 'POST /api/todos',
      list: 'GET /api/todos',
      get: 'GET /api/todos/:id',
      update: 'PUT /api/todos/:id',
      delete: 'DELETE /api/todos/:id',
      status: 'PATCH /api/todos/:id/status',
      history: 'GET /api/todos/:id/history',
      search: 'GET /api/todos/search/:query',
      stats: 'GET /api/todos/stats/overview'
    }
  });
});

// API Routes
app.use('/api/todos', todoRoutes);
// app.use('/api/todos', workingTodoRoutes); // Legacy backup route

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
