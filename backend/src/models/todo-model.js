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

export const Todo = mongoose.model('Todo', todoSchema);

// @CODE:TODO-STATUS-MODEL-001