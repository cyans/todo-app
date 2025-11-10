// Simple Todo Routes for Testing

import express from 'express';

const router = express.Router();

// Mock data for testing
let mockTodos = [
  {
    id: '1',
    text: 'React 프로젝트 설정하기',
    completed: false,
    priority: 'high',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: '백엔드 API 연동하기',
    completed: true,
    priority: 'medium',
    status: 'completed',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    text: '테스트 코드 작성하기',
    completed: false,
    priority: 'low',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// Get all todos
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockTodos,
      message: 'Todos retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create a new todo
router.post('/', (req, res) => {
  try {
    const { text, priority = 'medium' } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        error: 'Text is required',
        timestamp: new Date().toISOString()
      });
    }

    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    mockTodos.unshift(newTodo);

    res.status(201).json({
      success: true,
      data: newTodo,
      message: 'Todo created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update todo status
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed, status } = req.body;

    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({
        error: 'Todo not found',
        timestamp: new Date().toISOString()
      });
    }

    if (completed !== undefined) {
      mockTodos[todoIndex].completed = completed;
    }
    if (status) {
      mockTodos[todoIndex].status = status;
    }

    res.status(200).json({
      success: true,
      data: mockTodos[todoIndex],
      message: 'Todo updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Delete a todo
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({
        error: 'Todo not found',
        timestamp: new Date().toISOString()
      });
    }

    const deletedTodo = mockTodos.splice(todoIndex, 1)[0];

    res.status(200).json({
      success: true,
      data: deletedTodo,
      message: 'Todo deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;