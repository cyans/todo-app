import mongoose from 'mongoose';
import { Todo } from '../src/models/todo-model.js';

describe('Todo Model', () => {
  beforeEach(async () => {
    // Clear collection before each test
    await Todo.deleteMany({});
  });

  describe('Required Fields', () => {
    test('should fail validation when title is missing', async () => {
      const todo = new Todo({
        description: 'Test description',
        status: 'todo'
      });

      await expect(todo.validate()).rejects.toThrow();
    });

    test('should set default status when status is not provided', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        description: 'Test description'
      });

      await expect(todo.validate()).resolves.not.toThrow();
      expect(todo.status).toBe('todo');
    });

    test('should fail validation when status is invalid', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        description: 'Test description',
        status: 'invalid_status'
      });

      await expect(todo.validate()).rejects.toThrow();
    });
  });

  describe('Valid Status Values', () => {
    const validStatuses = ['todo', 'in_progress', 'review', 'done', 'archived'];

    validStatuses.forEach(status => {
      test(`should accept valid status: ${status}`, async () => {
        const todo = new Todo({
          title: 'Test Todo',
          description: 'Test description',
          status: status
        });

        await expect(todo.validate()).resolves.not.toThrow();
        expect(todo.status).toBe(status);
      });
    });
  });

  describe('Default Values', () => {
    test('should set default createdAt and updatedAt timestamps', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        description: 'Test description',
        status: 'todo'
      });

      await todo.save();
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });
  });

  describe('Status Transition History', () => {
    test('should initialize with empty status history', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        description: 'Test description',
        status: 'todo'
      });

      expect(todo.statusHistory).toBeDefined();
      expect(Array.isArray(todo.statusHistory)).toBe(true);
      expect(todo.statusHistory).toHaveLength(0);
    });
  });
});

// @TEST:TODO-STATUS-MODEL-001