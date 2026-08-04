import { clearRateLimitStore } from '../src/middlewares';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

beforeEach(() => {
  clearRateLimitStore();
});
