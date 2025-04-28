import { request } from './setup/utils';

describe('User Routes', () => {
  it('should get all users', async () => {
    const res = await request().get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
