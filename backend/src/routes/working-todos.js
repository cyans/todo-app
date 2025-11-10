// @CODE:TODO-API-001 - Working Todo API Implementation (Mock)
// Working Todo API - 완벽한 Mock API 구현

import express from 'express';

const router = express.Router();

// Mock 데이터 - 한국어 내용
let mockTodos = [
  {
    id: '1',
    text: 'React 프로젝트 설정 완료하기',
    completed: false,
    priority: 'high',
    status: 'pending',
    dueDate: '2025-11-10T23:59:59.000Z',
    createdAt: '2025-11-07T14:00:00.000Z',
    updatedAt: '2025-11-07T14:00:00.000Z'
  },
  {
    id: '2',
    text: '백엔드 API 연동 테스트',
    completed: true,
    priority: 'medium',
    status: 'completed',
    dueDate: '2025-11-08T18:00:00.000Z',
    createdAt: '2025-11-07T13:30:00.000Z',
    updatedAt: '2025-11-07T14:00:00.000Z'
  },
  {
    id: '3',
    text: 'UI/UX 개선 사항 적용',
    completed: false,
    priority: 'high',
    status: 'in_progress',
    dueDate: '2025-11-12T23:59:59.000Z',
    createdAt: '2025-11-07T13:45:00.000Z',
    updatedAt: '2025-11-07T14:00:00.000Z'
  },
  {
    id: '4',
    text: '반응형 디자인 테스트',
    completed: false,
    priority: 'low',
    status: 'pending',
    dueDate: '2025-11-20T23:59:59.000Z',
    createdAt: '2025-11-07T13:20:00.000Z',
    updatedAt: '2025-11-07T13:20:00.000Z'
  },
  {
    id: '5',
    text: '다크 모드 테마 구현',
    completed: false,
    priority: 'medium',
    status: 'pending',
    dueDate: '2025-11-15T23:59:59.000Z',
    createdAt: '2025-11-07T13:10:00.000Z',
    updatedAt: '2025-11-07T13:10:00.000Z'
  }
];

// Helper 함수: 필터링 및 정렬
function filterAndSortTodos(todos, filter = 'all', sortBy = 'created') {
  let filtered = [...todos];

  // 필터링
  if (filter === 'active') {
    filtered = filtered.filter(todo => !todo.completed);
  } else if (filter === 'completed') {
    filtered = filtered.filter(todo => todo.completed);
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // 마감일순 정렬 (마감일 없는 것은 맨 뒤로)
        if (!a.dueDate && !b.dueDate) return new Date(b.createdAt) - new Date(a.createdAt);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'text':
        return a.text.localeCompare(b.text, 'ko');
      case 'created':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return filtered;
}

// GET /api/todos - 모든 todos 가져오기
router.get('/', (req, res) => {
  try {
    console.log('WORKING TODOS ROUTE CALLED!!!');
    const { filter = 'all', sortBy = 'created', page = 1, limit = 10 } = req.query;

    const todos = filterAndSortTodos(mockTodos, filter, sortBy);
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTodos = todos.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        todos: paginatedTodos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: todos.length,
          pages: Math.ceil(todos.length / parseInt(limit))
        }
      },
      message: 'Todos retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    res.status(500).json({
      error: 'Failed to get todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/todos - 새 todo 생성
router.post('/', (req, res) => {
  try {
    const { text, priority = 'medium', dueDate } = req.body;

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
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockTodos.unshift(newTodo);

    res.status(201).json({
      success: true,
      data: newTodo,
      message: 'Todo created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    res.status(500).json({
      error: 'Failed to create todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/todos/:id - 특정 todo 가져오기
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todo = mockTodos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET /api/todos/:id error:', error);
    res.status(500).json({
      error: 'Failed to get todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/todos/:id - todo 업데이트
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const todoIndex = mockTodos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({
        error: 'Todo not found',
        timestamp: new Date().toISOString()
      });
    }

    // 유효한 필드만 업데이트
    const validFields = ['text', 'completed', 'priority', 'status', 'dueDate'];
    const filteredUpdateData = {};

    for (const field of validFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    mockTodos[todoIndex] = {
      ...mockTodos[todoIndex],
      ...filteredUpdateData,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: mockTodos[todoIndex],
      message: 'Todo updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PUT /api/todos/:id error:', error);
    res.status(500).json({
      error: 'Failed to update todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/todos/:id - todo 삭제
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const todoIndex = mockTodos.findIndex(t => t.id === id);
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
    console.error('DELETE /api/todos/:id error:', error);
    res.status(500).json({
      error: 'Failed to delete todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/todos/:id - todo 토글 (완료 상태 변경)
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { completed, status } = req.body;

    const todoIndex = mockTodos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({
        error: 'Todo not found',
        timestamp: new Date().toISOString()
      });
    }

    if (completed !== undefined) {
      mockTodos[todoIndex].completed = completed;
      mockTodos[todoIndex].status = completed ? 'completed' : 'pending';
    }

    if (status) {
      mockTodos[todoIndex].status = status;
      if (status === 'completed') {
        mockTodos[todoIndex].completed = true;
      }
    }

    mockTodos[todoIndex].updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      data: mockTodos[todoIndex],
      message: 'Todo toggled successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PATCH /api/todos/:id error:', error);
    res.status(500).json({
      error: 'Failed to toggle todo',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/todos/search/:query - todo 검색
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const { filter = 'all', sortBy = 'created', limit = 20 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Search query is required',
        timestamp: new Date().toISOString()
      });
    }

    const searchTerm = query.toLowerCase().trim();
    let searchResults = mockTodos.filter(todo =>
      todo.text.toLowerCase().includes(searchTerm)
    );

    // 필터링 및 정렬 적용
    searchResults = filterAndSortTodos(searchResults, filter, sortBy);

    // 결과 수 제한
    const limitedResults = searchResults.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        todos: limitedResults,
        query: searchTerm,
        count: limitedResults.length
      },
      message: 'Search completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET /api/todos/search/:query error:', error);
    res.status(500).json({
      error: 'Failed to search todos',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for todos endpoint
router.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      message: 'Todo API is running',
      data: {
        total_todos: mockTodos.length,
        completed: mockTodos.filter(t => t.completed).length,
        pending: mockTodos.filter(t => !t.completed).length,
        in_progress: mockTodos.filter(t => t.status === 'in_progress').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET /api/todos/health error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;