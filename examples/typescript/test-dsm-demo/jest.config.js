module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  globalSetup: './tests/setup/jest.globalSetup.ts',
  globalTeardown: './tests/setup/jest.globalTeardown.ts',
  setupFilesAfterEnv: [
    'dotenv/config', './tests/setup/jest.setup.ts',
  ],
};
