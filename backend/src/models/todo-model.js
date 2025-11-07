import mongoose from 'mongoose';

// Todo Status enum for type safety and consistency
export const TODO_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  ARCHIVED: 'archived'
};

// Status History Schema for tracking changes
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: Object.values(TODO_STATUS)
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Future implementation for user tracking
    required: false
  },
  reason: {
    type: String,
    required: false
  }
}, { _id: false });

// Main Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: Object.values(TODO_STATUS),
      message: 'Status must be one of: todo, in_progress, review, done, archived'
    },
    default: TODO_STATUS.TODO
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  statusHistory: {
    type: [statusHistorySchema],
    default: []
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if todo is completed
todoSchema.virtual('isCompleted').get(function() {
  return this.status === TODO_STATUS.DONE;
});

// Virtual for checking if todo is archived
todoSchema.virtual('isArchived').get(function() {
  return this.status === TODO_STATUS.ARCHIVED;
});

// Pre-save middleware to automatically add initial status to history
todoSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      reason: 'Initial creation'
    });
  }
  next();
});

// Method to update status with history tracking
todoSchema.methods.updateStatus = function(newStatus, changedBy, reason = '') {
  // Add current status to history before updating
  this.statusHistory.push({
    status: this.status,
    changedAt: new Date(),
    changedBy: changedBy,
    reason: reason
  });

  // Update current status
  this.status = newStatus;

  // Set completedAt when status becomes 'done'
  if (newStatus === TODO_STATUS.DONE && !this.completedAt) {
    this.completedAt = new Date();
  }

  return this.save();
};

// Method to get valid status transitions
todoSchema.methods.getValidTransitions = function() {
  const transitions = {
    [TODO_STATUS.TODO]: [TODO_STATUS.IN_PROGRESS, TODO_STATUS.ARCHIVED],
    [TODO_STATUS.IN_PROGRESS]: [TODO_STATUS.TODO, TODO_STATUS.REVIEW, TODO_STATUS.ARCHIVED],
    [TODO_STATUS.REVIEW]: [TODO_STATUS.IN_PROGRESS, TODO_STATUS.DONE, TODO_STATUS.TODO],
    [TODO_STATUS.DONE]: [TODO_STATUS.REVIEW, TODO_STATUS.TODO, TODO_STATUS.ARCHIVED],
    [TODO_STATUS.ARCHIVED]: [TODO_STATUS.TODO]
  };

  return transitions[this.status] || [];
};

// Static method to get all available statuses
todoSchema.statics.getAllStatuses = function() {
  return Object.values(TODO_STATUS);
};

// Static method for finding todos by status
todoSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Index for better query performance
todoSchema.index({ status: 1 });
todoSchema.index({ createdAt: -1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ assignedTo: 1 });

// Text search indexes for performance optimization
todoSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 8
  },
  name: 'todo_text_search_index'
});

// Additional indexes for filtering and sorting
todoSchema.index({ dueDate: 1 });
todoSchema.index({ tags: 1 });
todoSchema.index({ priority: 1, status: 1 });
todoSchema.index({ createdAt: -1, status: 1 });

// Static method for text search (refactored to reduce duplication)
todoSchema.statics.searchByText = function(searchText, options = {}) {
  const defaultOptions = {
    includeScore: true,
    sortByScore: true
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const query = { $text: { $search: searchText } };
  const projection = mergedOptions.includeScore ? { score: { $meta: 'textScore' } } : {};
  const sort = mergedOptions.sortByScore ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

  return this.find(query, projection).sort(sort);
};

// Static method for searching in title (convenience method)
todoSchema.statics.searchInTitle = function(searchText) {
  return this.searchByText(searchText);
};

// Static method for searching in description (convenience method)
todoSchema.statics.searchInDescription = function(searchText) {
  return this.searchByText(searchText);
};

// Static method for searching by tag
todoSchema.statics.searchByTag = function(tag) {
  return this.find({
    tags: { $in: [tag] }
  }).sort({ createdAt: -1 });
};

// Static method for finding by priority
todoSchema.statics.findByPriority = function(priority) {
  return this.find({
    priority: priority
  }).sort({ createdAt: -1 });
};

// Static method for finding by due date range
todoSchema.statics.findByDueDateRange = function(startDate, endDate) {
  return this.find({
    dueDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ dueDate: 1 });
};

// Static method for advanced search with multiple criteria (refactored)
todoSchema.statics.advancedSearch = function(criteria) {
  // If only text search is provided, use the optimized text search method
  if (criteria.text && !criteria.priority && !criteria.status &&
      !criteria.tags && !criteria.dueDateFrom && !criteria.dueDateTo &&
      !criteria.assignedTo) {
    return this.searchByText(criteria.text, {
      sortByScore: criteria.sortBy === 'score' || !criteria.sortBy,
      limit: criteria.limit,
      skip: criteria.skip
    });
  }

  // Complex search with multiple criteria
  const query = {};
  const sortOptions = {};

  // Priority filter
  if (criteria.priority) {
    query.priority = criteria.priority;
  }

  // Status filter
  if (criteria.status) {
    query.status = criteria.status;
  }

  // Tags filter (match any of the provided tags)
  if (criteria.tags && criteria.tags.length > 0) {
    query.tags = { $in: criteria.tags };
  }

  // Due date range filter
  if (criteria.dueDateFrom || criteria.dueDateTo) {
    query.dueDate = {};
    if (criteria.dueDateFrom) {
      query.dueDate.$gte = criteria.dueDateFrom;
    }
    if (criteria.dueDateTo) {
      query.dueDate.$lte = criteria.dueDateTo;
    }
  }

  // Assigned to filter
  if (criteria.assignedTo) {
    query.assignedTo = criteria.assignedTo;
  }

  // Add text search if provided
  if (criteria.text) {
    query.$text = { $search: criteria.text };
    sortOptions.score = { $meta: 'textScore' };
  }

  // Set up sorting
  const sortBy = criteria.sortBy || 'createdAt';
  const sortOrder = criteria.sortOrder || -1;
  sortOptions[sortBy] = sortOrder;

  // Build and execute the query
  let dbQuery = this.find(query);

  // Add sorting
  dbQuery = dbQuery.sort(sortOptions);

  // Pagination
  if (criteria.limit) {
    dbQuery = dbQuery.limit(criteria.limit);
  }
  if (criteria.skip) {
    dbQuery = dbQuery.skip(criteria.skip);
  }

  return dbQuery;
};

// Create the model
export const Todo = mongoose.model('Todo', todoSchema);

// Helper function to create indexes
export const createTodoIndexes = async () => {
  try {
    await Todo.createIndexes();
    console.log('✅ Todo indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating Todo indexes:', error);
    throw error;
  }
};

// @CODE:TODO-STATUS-MODEL-001
// @CODE:FILTER-SEARCH-004:MODEL