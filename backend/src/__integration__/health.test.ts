import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.ts';

describe('GET /v1/health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/v1/health');
    expect(res.status).toBe(200);
  });
});
