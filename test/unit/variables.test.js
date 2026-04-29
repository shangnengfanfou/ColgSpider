describe('_variables', () => {
  let variables;

  beforeAll(() => {
    variables = require('../../server/const/_variables');
  });

  it('should export PORT as a number', () => {
    expect(typeof variables.PORT).toBe('number');
    expect(variables.PORT).toBe(4396);
  });

  it('should export a valid MONGO_DB_URL', () => {
    expect(variables.MONGO_DB_URL).toMatch(/^mongodb:\/\//);
  });

  it('should export SERVER_BASE_URL with correct port', () => {
    expect(variables.SERVER_BASE_URL).toContain(String(variables.PORT));
    expect(variables.SERVER_BASE_URL).toMatch(/^http:\/\/localhost:/);
  });

  it('should export a URL string for the forum', () => {
    expect(typeof variables.URL).toBe('string');
    expect(variables.URL.length).toBeGreaterThan(0);
  });
});
