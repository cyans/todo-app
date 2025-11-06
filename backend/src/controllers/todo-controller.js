import { TODO_STATUS } from '../models/todo-model.js';
import TodoService from '../services/todo-service.js';

/**
 * Todo Controller - Handles HTTP requests for todo operations
 */

// Validation helper for status
const validateStatus = (status) => {
  if (!status || !Object.values(TODO_STATUS).includes(status)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${Object.values(TODO_STATUS).join(', ')}`
    };
  }
  return { isValid: true };
};

// Error response helper
const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Success response helper
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Update todo status
 * PUT /api/v1/todos/:id/status
 */
export const updateTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, changedBy, reason } = req.body;

    // Validate status
    const statusValidation = validateStatus(status);
    if (!statusValidation.isValid) {
      return sendErrorResponse(res, 400, statusValidation.error);
    }

    // Update status
    await TodoService.updateTodoStatus(id, status, changedBy, reason);

    // Get updated todo
    const updatedTodo = await TodoService.getTodoById(id);

    return sendSuccessResponse(res, 200, 'Status updated successfully', updatedTodo);
  } catch (error) {
    if (error.message.includes('Todo not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    if (error.message.includes('Invalid status transition')) {
      return sendErrorResponse(res, 400, error.message);
    }
    return sendErrorResponse(res, 500, `Failed to update status: ${error.message}`);
  }
};

/**
 * Create a new todo
 * POST /api/v1/todos
 */
export const createTodo = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return sendErrorResponse(res, 400, 'Title is required');
    }

    // Validate status if provided
    if (status) {
      const statusValidation = validateStatus(status);
      if (!statusValidation.isValid) {
        return sendErrorResponse(res, 400, statusValidation.error);
      }
    }

    const todoData = {
      title: title.trim(),
      description: description?.trim() || '',
      status,
      priority,
      dueDate,
      tags: tags || []
    };

    const newTodo = await TodoService.createTodo(todoData);
    return sendSuccessResponse(res, 201, 'Todo created successfully', newTodo);
  } catch (error) {
    return sendErrorResponse(res, 500, `Failed to create todo: ${error.message}`);
  }
};

/**
 * Get all todos (with optional status filter)
 * GET /api/v1/todos
 */
export const getAllTodos = async (req, res) => {
  try {
    const { status } = req.query;

    let todos;
    if (status) {
      // Validate status filter
      const statusValidation = validateStatus(status);
      if (!statusValidation.isValid) {
        return sendErrorResponse(res, 400, statusValidation.error);
      }
      todos = await TodoService.getTodosByStatus(status);
    } else {
      todos = await TodoService.getAllTodos();
    }

    return sendSuccessResponse(res, 200, 'Todos retrieved successfully', todos);
  } catch (error) {
    return sendErrorResponse(res, 500, `Failed to get todos: ${error.message}`);
  }
};

/**
 * Get a single todo by ID
 * GET /api/v1/todos/:id
 */
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await TodoService.getTodoById(id);
    return sendSuccessResponse(res, 200, 'Todo retrieved successfully', todo);
  } catch (error) {
    if (error.message.includes('Todo not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    return sendErrorResponse(res, 500, `Failed to get todo: ${error.message}`);
  }
};

/**
 * Update todo details (excluding status)
 * PUT /api/v1/todos/:id
 */
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, tags } = req.body;

    // Validate title if provided
    if (title !== undefined && (title === null || title.trim() === '')) {
      return sendErrorResponse(res, 400, 'Title cannot be empty');
    }

    const updateData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || '' }),
      priority,
      dueDate,
      tags
    };

    const updatedTodo = await TodoService.updateTodo(id, updateData);
    return sendSuccessResponse(res, 200, 'Todo updated successfully', updatedTodo);
  } catch (error) {
    if (error.message.includes('Todo not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    return sendErrorResponse(res, 500, `Failed to update todo: ${error.message}`);
  }
};

/**
 * Delete a todo
 * DELETE /api/v1/todos/:id
 */
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    await TodoService.deleteTodo(id);
    return sendSuccessResponse(res, 200, 'Todo deleted successfully');
  } catch (error) {
    if (error.message.includes('Todo not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    return sendErrorResponse(res, 500, `Failed to delete todo: ${error.message}`);
  }
};

/**
 * Get todo status history
 * GET /api/v1/todos/:id/history
 */
export const getTodoStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await TodoService.getTodoStatusHistory(id);
    return sendSuccessResponse(res, 200, 'Status history retrieved successfully', history);
  } catch (error) {
    if (error.message.includes('Todo not found')) {
      return sendErrorResponse(res, 404, error.message);
    }
    return sendErrorResponse(res, 500, `Failed to get status history: ${error.message}`);
  }
};

/**
 * Get todo statistics
 * GET /api/v1/todos/stats
 */
export const getTodoStatistics = async (req, res) => {
  try {
    const stats = await TodoService.getTodoStatistics();
    return sendSuccessResponse(res, 200, 'Statistics retrieved successfully', stats);
  } catch (error) {
    return sendErrorResponse(res, 500, `Failed to get statistics: ${error.message}`);
  }
};

// @CODE:TODO-STATUS-API-001