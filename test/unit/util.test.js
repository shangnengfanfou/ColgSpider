const { getNextUrl, delay, readWordsFromFile } = require('../../server/spider/util');
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

describe('util', () => {
  describe('getNextUrl', () => {
    it('should return a URL with the given page number', () => {
      const url = getNextUrl(1);
      expect(url).toContain('1.html');
    });

    it('should default to page 1', () => {
      const url = getNextUrl();
      expect(url).toContain('1.html');
    });

    it('should handle arbitrary page numbers', () => {
      const url = getNextUrl(42);
      expect(url).toContain('42.html');
    });
  });

  describe('delay', () => {
    it('should resolve after the specified timeout', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });

    it('should use default timeout when no argument provided', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('readWordsFromFile', () => {
    const originalReadFileSync = fs.readFileSync;

    afterEach(() => {
      fs.readFileSync = originalReadFileSync;
    });

    it('should read and return word.txt content', () => {
      const mockData = '[["hello",5],["world",3]]';
      fs.readFileSync = jest.fn().mockReturnValue(mockData);

      const result = readWordsFromFile();
      expect(result).toBe(mockData);
      expect(fs.readFileSync).toHaveBeenCalledWith('word.txt', {
        encoding: 'utf-8',
      });
    });
  });
});
