import express from 'express';
import {
  updateTodoStatus,
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getTodoStatusHistory,
  getTodoStatistics
} from '../controllers/todo-controller.js';

const router = express.Router();

/**
 * Todo Routes
 * Base path: /api/v1/todos
 */

// GET /api/v1/todos - Get all todos (with optional status filter)
router.get('/', getAllTodos);

// GET /api/v1/todos/stats - Get todo statistics
router.get('/stats', getTodoStatistics);

// POST /api/v1/todos - Create a new todo
router.post('/', createTodo);

// GET /api/v1/todos/:id - Get a single todo by ID
router.get('/:id', getTodoById);

// GET /api/v1/todos/:id/history - Get todo status history
router.get('/:id/history', getTodoStatusHistory);

// PUT /api/v1/todos/:id - Update todo details (excluding status)
router.put('/:id', updateTodo);

// PUT /api/v1/todos/:id/status - Update todo status
router.put('/:id/status', updateTodoStatus);

// DELETE /api/v1/todos/:id - Delete a todo
router.delete('/:id', deleteTodo);

export default router;

// @CODE:TODO-STATUS-API-001