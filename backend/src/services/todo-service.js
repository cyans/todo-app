import { Todo, TODO_STATUS } from '../models/todo-model.js';

/**
 * Todo Service - Business logic for todo operations
 * Handles all todo-related operations with proper validation and error handling
 */
class TodoService {
  /**
   * Validate status value
   * @param {string} status - Status to validate
   * @private
   */
  static _validateStatus(status) {
    if (!Object.values(TODO_STATUS).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
  }

  /**
   * Update the status of a todo item with validation
   * @param {string} todoId - The ID of the todo item
   * @param {string} newStatus - The new status to set
   * @param {string} changedBy - User ID who made the change (optional)
   * @param {string} reason - Reason for the status change (optional)
   * @returns {Promise<boolean>} - True if successful, throws error if failed
   */
  static async updateTodoStatus(todoId, newStatus, changedBy = undefined, reason = '') {
    try {
      // Validate the new status
      this._validateStatus(newStatus);

      // Find the todo item
      const todo = await Todo.findById(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }

      // Check if the transition is valid
      const validTransitions = todo.getValidTransitions();
      if (!validTransitions.includes(newStatus)) {
        throw new Error('Invalid status transition');
      }

      // Update the status with history tracking
      await todo.updateStatus(newStatus, changedBy, reason);

      return true;
    } catch (error) {
      throw new Error(`Failed to update todo status: ${error.message}`);
    }
  }

  /**
   * Create a new todo item
   * @param {Object} todoData - Todo data
   * @param {string} todoData.title - Todo title
   * @param {string} todoData.description - Todo description (optional)
   * @param {string} todoData.status - Initial status (optional, defaults to 'todo')
   * @param {string} todoData.priority - Priority level (optional)
   * @param {Date} todoData.dueDate - Due date (optional)
   * @param {Array} todoData.tags - Tags array (optional)
   * @returns {Promise<Object>} - Created todo object
   */
  static async createTodo(todoData) {
    try {
      // Set default status if not provided
      const todoToCreate = {
        ...todoData,
        status: todoData.status || TODO_STATUS.TODO
      };

      // Validate status if provided
      if (todoData.status) {
        this._validateStatus(todoData.status);
      }

      const newTodo = await Todo.create(todoToCreate);
      return newTodo;
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }
  }

  /**
   * Get all todos filtered by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} - Array of todo objects
   */
  static async getTodosByStatus(status) {
    try {
      // Validate status
      this._validateStatus(status);

      const todos = await Todo.findByStatus(status);
      return todos;
    } catch (error) {
      throw new Error(`Failed to get todos by status: ${error.message}`);
    }
  }

  /**
   * Get all todos
   * @returns {Promise<Array>} - Array of all todo objects
   */
  static async getAllTodos() {
    try {
      const todos = await Todo.find().sort({ createdAt: -1 });
      return todos;
    } catch (error) {
      throw new Error(`Failed to get all todos: ${error.message}`);
    }
  }

  /**
   * Get a single todo by ID
   * @param {string} todoId - The ID of the todo item
   * @returns {Promise<Object>} - Todo object
   */
  static async getTodoById(todoId) {
    try {
      const todo = await Todo.findById(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }
      return todo;
    } catch (error) {
      throw new Error(`Failed to get todo: ${error.message}`);
    }
  }

  /**
   * Update todo details (excluding status)
   * @param {string} todoId - The ID of the todo item
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated todo object
   */
  static async updateTodo(todoId, updateData) {
    try {
      // Remove status from updateData as it should be updated via updateTodoStatus
      const { status, ...safeUpdateData } = updateData;

      const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        safeUpdateData,
        { new: true, runValidators: true }
      );

      if (!updatedTodo) {
        throw new Error('Todo not found');
      }

      return updatedTodo;
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }

  /**
   * Delete a todo item
   * @param {string} todoId - The ID of the todo item
   * @returns {Promise<boolean>} - True if successful
   */
  static async deleteTodo(todoId) {
    try {
      const deletedTodo = await Todo.findByIdAndDelete(todoId);
      if (!deletedTodo) {
        throw new Error('Todo not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }

  /**
   * Get status transition statistics
   * @param {string} todoId - The ID of the todo item
   * @returns {Promise<Object>} - Status transition data
   */
  static async getTodoStatusHistory(todoId) {
    try {
      const todo = await Todo.findById(todoId);
      if (!todo) {
        throw new Error('Todo not found');
      }

      return {
        currentStatus: todo.status,
        statusHistory: todo.statusHistory,
        validTransitions: todo.getValidTransitions()
      };
    } catch (error) {
      throw new Error(`Failed to get status history: ${error.message}`);
    }
  }

  /**
   * Get todos with statistics by status
   * @returns {Promise<Object>} - Statistics object
   */
  static async getTodoStatistics() {
    try {
      const stats = await Todo.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statistics = {};
      Object.values(TODO_STATUS).forEach(status => {
        statistics[status] = 0;
      });

      stats.forEach(stat => {
        statistics[stat._id] = stat.count;
      });

      return {
        byStatus: statistics,
        total: Object.values(statistics).reduce((sum, count) => sum + count, 0)
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

export default TodoService;

// @CODE:TODO-STATUS-SERVICE-001