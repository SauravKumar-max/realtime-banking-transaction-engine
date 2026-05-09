import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { executeMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
}));

vi.mock('../../src/db/connection.js', () => ({
  db: {
    execute: executeMock,
  },
}));

const { default: app } = await import('../../src/app.js');

afterEach(() => {
  executeMock.mockReset();
});

describe('app', () => {
  describe('GET /', () => {
    it('returns the welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Welcome to Real-Time Banking Transaction Processing System',
      });
    });
  });

  describe('GET /health', () => {
    it('returns healthy when the database check succeeds', async () => {
      executeMock.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        database: 'connected',
      });
      expect(executeMock).toHaveBeenCalledTimes(1);
    });

    it('returns service unavailable when the database check fails', async () => {
      executeMock.mockRejectedValueOnce(new Error('database unavailable'));

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        status: 'error',
        database: 'unavailable',
      });
      expect(executeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for routes that do not exist', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });
  });
});
