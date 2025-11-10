// @CODE:TODO-API-002 - Todo API Routes (Full Implementation)

import express from 'express';
import todoService from '../services/todo-service.js';
import logger from '../utils/logger.js';
import performanceMonitor from '../middleware/performance.js';

const router = express.Router();

// Health check endpoint
router.get('/health', performanceMonitor, async (req, res) => {
  try {
    const healthStatus = await todoService.getTodoStats();
    res.status(200).json({
      status: 'healthy',
      message: 'Todo API is running',
      timestamp: new Date().toISOString(),
      data: healthStatus
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Todo API health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create a new todo
router.post('/', performanceMonitor, async (req, res) => {
  try {
    const { text, priority } = req.body;

    // Input validation
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: 'Text is required and must be a non-empty string',
        timestamp: new Date().toISOString()
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Priority must be one of: low, medium, high',
        timestamp: new Date().toISOString()
      });
    }

    const todo = await todoService.createTodo({ text, priority });

    res.status(201).json({
      success: true,
      data: todo,
      message: 'Todo created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create todo:', error);
    res.status(500).json({
      error: 'Failed to create todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all todos with filtering and pagination
router.get('/', performanceMonitor, async (req, res) => {
  try {
    const {
      filter = 'all',
      sortBy = 'created',
      page = 1,
      limit = 10
    } = req.query;

    // Validate query parameters
    const validFilters = ['all', 'active', 'completed'];
    const validSorts = ['created', 'priority', 'text'];

    if (!validFilters.includes(filter)) {
      return res.status(400).json({
        error: 'Invalid filter parameter',
        validFilters,
        timestamp: new Date().toISOString()
      });
    }

    if (!validSorts.includes(sortBy)) {
      return res.status(400).json({
        error: 'Invalid sort parameter',
        validSorts,
        timestamp: new Date().toISOString()
      });
    }

    const result = await todoService.getAllTodos(
      filter,
      sortBy,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.todos,
      pagination: result.pagination,
      filter,
      sortBy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get todos:', error);
    res.status(500).json({
      error: 'Failed to get todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get a single todo by ID
router.get('/:id', performanceMonitor, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Todo ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const todo = await todoService.getTodoById(id);

    res.status(200).json({
      success: true,
      data: todo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get todo:', error);
    res.status(error.message === 'Todo not found' ? 404 : 500).json({
      error: 'Failed to get todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update a todo item
router.put('/:id', performanceMonitor, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Todo ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate update data
    const allowedUpdates = ['text', 'completed', 'priority', 'status'];
    const updates = Object.keys(updateData);

    const hasInvalidUpdate = updates.some(update => !allowedUpdates.includes(update));
    if (hasInvalidUpdate) {
      return res.status(400).json({
        error: 'Invalid update fields',
        allowedUpdates,
        timestamp: new Date().toISOString()
      });
    }

    // Validate status transition
    if (updateData.status) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          error: 'Invalid status value',
          validStatuses,
          timestamp: new Date().toISOString()
        });
      }
    }

    const todo = await todoService.updateTodo(id, updateData);

    res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to update todo:', error);
    res.status(error.message === 'Todo not found' ? 404 : 500).json({
      error: 'Failed to update todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Delete a todo item
router.delete('/:id', performanceMonitor, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Todo ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await todoService.deleteTodo(id);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Todo deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to delete todo:', error);
    res.status(error.message === 'Todo not found' ? 404 : 500).json({
      error: 'Failed to delete todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update todo status with validation
router.patch('/:id/status', performanceMonitor, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Todo ID is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }

    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value',
        validStatuses,
        timestamp: new Date().toISOString()
      });
    }

    const todo = await todoService.updateTodoStatus(id, status);

    res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo status updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to update todo status:', error);
    res.status(error.message === 'Todo not found' ? 404 : 500).json({
      error: 'Failed to update todo status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get todo status history
router.get('/:id/history', performanceMonitor, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Todo ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const history = await todoService.getTodoStatusHistory(id);

    res.status(200).json({
      success: true,
      data: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get todo status history:', error);
    res.status(error.message === 'Todo not found' ? 404 : 500).json({
      error: 'Failed to get todo status history',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Search todos
router.get('/search/:query', performanceMonitor, async (req, res) => {
  try {
    const { query } = req.params;
    const { filter = 'all', sortBy = 'created', limit = 20 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Search query is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await todoService.searchTodos(
      query,
      filter,
      sortBy,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to search todos:', error);
    res.status(500).json({
      error: 'Failed to search todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get todos by priority
router.get('/priority/:priority', performanceMonitor, async (req, res) => {
  try {
    const { priority } = req.params;
    const { filter = 'all' } = req.query;

    if (!priority) {
      return res.status(400).json({
        error: 'Priority is required',
        validPriorities: ['low', 'medium', 'high'],
        timestamp: new Date().toISOString()
      });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority value',
        validPriorities,
        timestamp: new Date().toISOString()
      });
    }

    const result = await todoService.getTodosByPriority(priority, filter);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get todos by priority:', error);
    res.status(500).json({
      error: 'Failed to get todos by priority',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get todo statistics
router.get('/stats/overview', performanceMonitor, async (req, res) => {
  try {
    const stats = await todoService.getTodoStats();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get todo stats:', error);
    res.status(500).json({
      error: 'Failed to get todo stats',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cleanup old todos (admin/maintenance endpoint)
router.delete('/cleanup/old', performanceMonitor, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    if (!days || isNaN(parseInt(days))) {
      return res.status(400).json({
        error: 'Days parameter must be a valid number',
        timestamp: new Date().toISOString()
      });
    }

    const result = await todoService.cleanupOldTodos(parseInt(days));

    res.status(200).json({
      success: true,
      data: result,
      message: `Cleaned up todos older than ${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to cleanup todos:', error);
    res.status(500).json({
      error: 'Failed to cleanup todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  logger.error('Todo routes error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

export default router;