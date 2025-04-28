import { request } from './setup/utils';

describe('User Routes', () => {
  it('should delete a user', async () => {
    const res = await request().delete('/users/1');
    expect(res.status).toBe(204);
  });
});
