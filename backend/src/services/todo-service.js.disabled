// @CODE:TODO-SERVICE-001 - Todo Service Implementation

import mongoose from 'mongoose';
import database from '../config/database.js';
import logger from '../utils/logger.js';

// Todo Schema for Mongoose 8.x
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Mongoose 8.x에서 자동 createdAt/updatedAt 관리
  collection: 'todos'
});

// Create and export the model
const Todo = mongoose.model('Todo', todoSchema);

class TodoService {
  constructor() {
    this.initialized = false;
  }

  // Initialize connection to database
  async initializeCollection() {
    try {
      if (!this.initialized) {
        await database.connect();
        this.initialized = true;
        logger.info('Todo service initialized successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize todo service:', error);
      throw error;
    }
  }

  // Create a new todo item
  async createTodo(todoData) {
    try {
      await this.initializeCollection();

      const todo = new Todo({
        text: todoData.text,
        priority: todoData.priority || 'medium',
        status: 'pending',
        statusHistory: [{
          fromStatus: null,
          toStatus: 'pending',
          changedAt: new Date()
        }]
      });

      const savedTodo = await todo.save();
      logger.info('Todo created successfully:', { id: savedTodo._id, text: savedTodo.text });

      return savedTodo.toJSON();
    } catch (error) {
      logger.error('Failed to create todo:', error);
      throw error;
    }
  }

  // Get all todos with filtering and pagination
  async getAllTodos(filter = 'all', sortBy = 'created', page = 1, limit = 10) {
    try {
      await this.initializeCollection();

      // Build filter query
      let query = {};
      if (filter === 'active') {
        query.completed = false;
      } else if (filter === 'completed') {
        query.completed = true;
      }

      // Build sort options
      let sortOptions = {};
      switch (sortBy) {
        case 'priority':
          sortOptions = { priority: -1, createdAt: -1 };
          break;
        case 'text':
          sortOptions = { text: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const todos = await Todo.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Todo.countDocuments(query);

      return {
        todos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get todos:', error);
      throw error;
    }
  }

  // Get a single todo by ID
  async getTodoById(id) {
    try {
      await this.initializeCollection();

      const todo = await Todo.findById(id).lean();
      if (!todo) {
        throw new Error('Todo not found');
      }

      return todo;
    } catch (error) {
      logger.error('Failed to get todo by ID:', error);
      throw error;
    }
  }

  // Update a todo item
  async updateTodo(id, updateData) {
    try {
      await this.initializeCollection();

      // Add updated timestamp
      updateData.updatedAt = new Date();

      // Handle status change history
      if (updateData.status) {
        const existingTodo = await Todo.findById(id);
        if (existingTodo && existingTodo.status !== updateData.status) {
          updateData.$push = {
            statusHistory: {
              fromStatus: existingTodo.status,
              toStatus: updateData.status,
              changedAt: new Date()
            }
          };
        }
      }

      const todo = await Todo.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!todo) {
        throw new Error('Todo not found');
      }

      logger.info('Todo updated successfully:', { id, updates: Object.keys(updateData) });
      return todo;
    } catch (error) {
      logger.error('Failed to update todo:', error);
      throw error;
    }
  }

  // Update todo status specifically
  async updateTodoStatus(id, status) {
    try {
      await this.initializeCollection();

      const existingTodo = await Todo.findById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const statusHistoryEntry = {
        fromStatus: existingTodo.status,
        toStatus: status,
        changedAt: new Date()
      };

      const todo = await Todo.findByIdAndUpdate(
        id,
        {
          status,
          updatedAt: new Date(),
          $push: { statusHistory: statusHistoryEntry }
        },
        { new: true }
      ).lean();

      logger.info('Todo status updated successfully:', { id, from: existingTodo.status, to: status });
      return todo;
    } catch (error) {
      logger.error('Failed to update todo status:', error);
      throw error;
    }
  }

  // Delete a todo item
  async deleteTodo(id) {
    try {
      await this.initializeCollection();

      const todo = await Todo.findByIdAndDelete(id).lean();
      if (!todo) {
        throw new Error('Todo not found');
      }

      logger.info('Todo deleted successfully:', { id, text: todo.text });
      return { id, deleted: true };
    } catch (error) {
      logger.error('Failed to delete todo:', error);
      throw error;
    }
  }

  // Get todo status history
  async getTodoStatusHistory(id) {
    try {
      await this.initializeCollection();

      const todo = await Todo.findById(id).select('statusHistory').lean();
      if (!todo) {
        throw new Error('Todo not found');
      }

      return todo.statusHistory;
    } catch (error) {
      logger.error('Failed to get todo status history:', error);
      throw error;
    }
  }

  // Search todos
  async searchTodos(query, filter = 'all', sortBy = 'created', limit = 20) {
    try {
      await this.initializeCollection();

      // Build search query
      let searchQuery = {
        $text: { $search: query }
      };

      // Add filter if specified
      if (filter === 'active') {
        searchQuery.completed = false;
      } else if (filter === 'completed') {
        searchQuery.completed = true;
      }

      // Build sort options
      let sortOptions = {};
      switch (sortBy) {
        case 'priority':
          sortOptions = { priority: -1, createdAt: -1 };
          break;
        case 'text':
          sortOptions = { text: 1 };
          break;
        case 'relevance':
          sortOptions = { score: { $meta: 'textScore' } };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const todos = await Todo.find(searchQuery, sortOptions === { score: { $meta: 'textScore' } } ? { score: { $meta: 'textScore' } } : {})
        .sort(sortOptions)
        .limit(limit)
        .lean();

      return {
        todos,
        query,
        count: todos.length
      };
    } catch (error) {
      logger.error('Failed to search todos:', error);
      throw error;
    }
  }

  // Get todos by priority
  async getTodosByPriority(priority, filter = 'all') {
    try {
      await this.initializeCollection();

      let query = { priority };

      // Add filter if specified
      if (filter === 'active') {
        query.completed = false;
      } else if (filter === 'completed') {
        query.completed = true;
      }

      const todos = await Todo.find(query).sort({ createdAt: -1 }).lean();

      return {
        todos,
        priority,
        count: todos.length
      };
    } catch (error) {
      logger.error('Failed to get todos by priority:', error);
      throw error;
    }
  }

  // Get todo statistics
  async getTodoStats() {
    try {
      await this.initializeCollection();

      const stats = await Todo.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            highPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
            },
            mediumPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
            },
            lowPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      };

      result.active = result.total - result.completed;
      result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

      return result;
    } catch (error) {
      logger.error('Failed to get todo stats:', error);
      throw error;
    }
  }

  // Cleanup old todos
  async cleanupOldTodos(days = 30) {
    try {
      await this.initializeCollection();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await Todo.deleteMany({
        completed: true,
        updatedAt: { $lt: cutoffDate }
      });

      logger.info('Old todos cleaned up:', { deletedCount: result.deletedCount, days });
      return {
        deletedCount: result.deletedCount,
        cutoffDate,
        days
      };
    } catch (error) {
      logger.error('Failed to cleanup old todos:', error);
      throw error;
    }
  }
}

export default new TodoService();