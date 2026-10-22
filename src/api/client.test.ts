import { describe, it, expect, beforeEach } from 'vitest';
import {
  ApiError,
  getBaseUrl,
  setBaseUrl,
  getStoredToken,
  setStoredToken,
  getStoredApiKey,
  setStoredApiKey,
} from './client';

describe('API Client Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('instantiates ApiError with status and details', () => {
    const err = new ApiError('Not found', 404, { resource: 'repo' });
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.details).toEqual({ resource: 'repo' });
  });

  it('manages base url in localStorage', () => {
    expect(getBaseUrl()).toBe('http://localhost:8000');
    setBaseUrl('https://my-backend.run.app/');
    expect(getBaseUrl()).toBe('https://my-backend.run.app');
  });

  it('manages github token in localStorage', () => {
    expect(getStoredToken()).toBe('');
    setStoredToken(' ghp_secretToken123 ');
    expect(getStoredToken()).toBe('ghp_secretToken123');
    setStoredToken('');
    expect(getStoredToken()).toBe('');
  });

  it('manages api key in localStorage', () => {
    expect(getStoredApiKey()).toBe('');
    setStoredApiKey('my-secret-key');
    expect(getStoredApiKey()).toBe('my-secret-key');
    setStoredApiKey('');
    expect(getStoredApiKey()).toBe('');
  });
});

