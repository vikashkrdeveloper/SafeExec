// Global test setup
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/rce_test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = 'test_secret';

// Increase timeout for Docker operations
jest.setTimeout(60000);

describe('Test Environment Setup', () => {
  test('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.MONGODB_URI).toContain('rce_test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});
