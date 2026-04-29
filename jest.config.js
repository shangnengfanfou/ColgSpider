module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/spider/spider.js',
    '!server/spider/content.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
};
