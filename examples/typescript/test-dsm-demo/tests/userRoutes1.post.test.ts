import { request } from './setup/utils';

describe('User Routes', () => {
  it('should create a new user with a country', async () => {
    const res = await request()
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', country_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('John Doe');
    expect(res.body.country_id).toBe(1);
  });
});
