// @CODE:TODO-CRUD-001:API
/**
 * Todo API Routes
 *
 * RESTful API endpoints for Todo CRUD operations.
 * Implements all endpoints defined in SPEC-TODO-CRUD-001.
 *
 * Endpoints:
 * - POST /api/todos - Create new todo
 * - GET /api/todos - Get all todos
 * - GET /api/todos/:id - Get specific todo
 * - PUT /api/todos/:id - Update specific todo
 * - DELETE /api/todos/:id - Delete specific todo
 * - GET /api/todos/stats - Get todo statistics
 * - PATCH /api/todos/:id/toggle - Toggle todo completion
 * - GET /api/todos/search - Search todos
 *
 * @module routes/todos
 */

import { Router } from 'express';
import TodoService from '../services/todo-service.js';
import {
  validateTodoCreation,
  validateTodoUpdate,
  validateObjectId,
  validateSearchQuery,
  validateTodoQuery,
  validatePagination,
  validateStatusFilter,
  validateContentType
} from '../middleware/validation.js';
import {
  asyncHandler,
  NotFoundError
} from '../middleware/errorHandler.js';

const router = Router();
const todoService = new TodoService();

// Apply content-type validation for POST, PUT, PATCH requests
router.use(validateContentType);

/**
 * POST /api/todos
 * Create a new todo
 *
 * @route POST /api/todos
 * @body {Object} todoData - Todo creation data
 * @returns {Object} Created todo object
 * @throws {400} Validation error
 */
router.post('/',
  validateTodoCreation,
  asyncHandler(async (req, res) => {
    const todo = await todoService.createTodo(req.body);

    res.status(201).json({
      success: true,
      data: todo,
      message: 'Todo created successfully'
    });
  })
);

/**
 * GET /api/todos
 * Get all todos with optional filtering and pagination
 *
 * @route GET /api/todos
 * @query {Object} filters - Query parameters for filtering
 * @returns {Object} Todos array and pagination info
 */
router.get('/',
  validateTodoQuery,
  asyncHandler(async (req, res) => {
    const { completed, priority } = req.query;
    let todos;

    // Apply filters if provided
    if (completed !== undefined) {
      todos = await todoService.getTodosByStatus(completed === 'true');
    } else if (priority) {
      todos = await todoService.getTodosByPriority(priority);
    } else {
      todos = await todoService.getAllTodos();
    }

    res.json({
      success: true,
      data: {
        todos,
        total: todos.length,
        filters: {
          completed: completed !== undefined ? completed === 'true' : undefined,
          priority: priority || undefined
        }
      }
    });
  })
);

/**
 * GET /api/todos/stats
 * Get todo statistics
 *
 * @route GET /api/todos/stats
 * @returns {Object} Statistics object
 */
router.get('/stats',
  asyncHandler(async (req, res) => {
    const stats = await todoService.getTodoStats();

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * GET /api/todos/search
 * Search todos by title or description
 *
 * @route GET /api/todos/search
 * @query {string} q - Search query
 * @returns {Array} Array of matching todos
 */
router.get('/search',
  validateSearchQuery,
  asyncHandler(async (req, res) => {
    const { q: query } = req.query;
    const todos = await todoService.searchTodos(query);

    res.json({
      success: true,
      data: todos,
      meta: {
        query,
        count: todos.length
      }
    });
  })
);

/**
 * GET /api/todos/:id
 * Get a specific todo by ID
 *
 * @route GET /api/todos/:id
 * @param {string} id - Todo ID
 * @returns {Object} Todo object
 * @throws {404} Todo not found
 * @throws {400} Invalid ID format
 */
router.get('/:id',
  validateObjectId,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await todoService.getTodoById(id);

    if (!todo) {
      throw new NotFoundError('Todo');
    }

    res.json({
      success: true,
      data: todo
    });
  })
);

/**
 * PUT /api/todos/:id
 * Update a specific todo by ID
 *
 * @route PUT /api/todos/:id
 * @param {string} id - Todo ID
 * @body {Object} updateData - Todo update data
 * @returns {Object} Updated todo object
 * @throws {404} Todo not found
 * @throws {400} Validation error or Invalid ID format
 */
router.put('/:id',
  validateObjectId,
  validateTodoUpdate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedTodo = await todoService.updateTodo(id, req.body);

    if (!updatedTodo) {
      throw new NotFoundError('Todo');
    }

    res.json({
      success: true,
      data: updatedTodo,
      message: 'Todo updated successfully'
    });
  })
);

/**
 * DELETE /api/todos/:id
 * Delete a specific todo by ID
 *
 * @route DELETE /api/todos/:id
 * @param {string} id - Todo ID
 * @returns {204} No content
 * @throws {404} Todo not found
 * @throws {400} Invalid ID format
 */
router.delete('/:id',
  validateObjectId,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await todoService.deleteTodo(id);

    if (!deleted) {
      throw new NotFoundError('Todo');
    }

    res.status(204).send();
  })
);

/**
 * PATCH /api/todos/:id/toggle
 * Toggle completion status of a specific todo
 *
 * @route PATCH /api/todos/:id/toggle
 * @param {string} id - Todo ID
 * @returns {Object} Updated todo object
 * @throws {404} Todo not found
 * @throws {400} Invalid ID format
 */
router.patch('/:id/toggle',
  validateObjectId,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedTodo = await todoService.toggleTodoStatus(id);

    if (!updatedTodo) {
      throw new NotFoundError('Todo');
    }

    res.json({
      success: true,
      data: updatedTodo,
      message: `Todo marked as ${updatedTodo.completed ? 'completed' : 'incomplete'}`
    });
  })
);

export default router;