import { useState } from 'react';
import { format } from 'date-fns';

const TodoItem = ({ todo, onToggle, onUpdate, onDelete, isLoading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority
  });
  const [errors, setErrors] = useState({});

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (editForm.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (editForm.description && editForm.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    try {
      await onUpdate(todo.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleEditCancel = () => {
    setEditForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleToggle = async () => {
    try {
      await onToggle(todo.id);
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await onDelete(todo.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-3 transition-all duration-200 ${
      todo.completed
        ? 'border-gray-200 dark:border-gray-600 opacity-75'
        : 'border-gray-300 dark:border-gray-600 hover:shadow-md'
    }`}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              placeholder="Description (optional)"
              rows={2}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <select
              name="priority"
              value={editForm.priority}
              onChange={handleEditChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={isLoading}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={handleToggle}
                  disabled={isLoading}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${
                  todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                }`}>
                  {todo.title}
                </h3>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                  {getPriorityIcon(todo.priority)} {todo.priority}
                </span>
              </div>

              {todo.description && (
                <p className={`text-gray-600 dark:text-gray-300 ml-8 ${
                  todo.completed ? 'line-through' : ''
                }`}>
                  {todo.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                title="Edit todo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete todo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ml-8">
            <div className="flex items-center space-x-4">
              <span>
                Created: {format(new Date(todo.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
              {todo.updatedAt !== todo.createdAt && (
                <span>
                  Updated: {format(new Date(todo.updatedAt), 'MMM d, yyyy h:mm a')}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                todo.completed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              }`}>
                {todo.completed ? '✅ Completed' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;