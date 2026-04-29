const fs = require('fs');

jest.mock('../../server/db/db', () => ({
  getModel: () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  }),
}));

jest.mock('colors', () => {
  const handler = { get: (_target, _prop) => '' };
  return new Proxy({}, handler);
});

let request;
let app;

beforeAll(() => {
  const supertest = require('supertest');
  const { createApp } = require('../../server/app');
  app = createApp();
  request = supertest(app);
});

describe('Express App', () => {
  describe('GET /', () => {
    it('should return 200', async () => {
      const res = await request.get('/');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /data', () => {
    it('should return JSON data when word.txt exists', async () => {
      const mockData = '[["hello",5],["world",3]]';
      const spy = jest.spyOn(fs, 'readFileSync').mockReturnValue(mockData);

      const res = await request.get('/data');
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();

      spy.mockRestore();
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request.get('/nonexistent-route-xyz');
      expect(res.status).toBe(404);
    });
  });
});
