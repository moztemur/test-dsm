import { request } from './setup/utils';

describe('User Routes', () => {
  it('should update a user', async () => {
    const res = await request()
      .put('/users/1')
      .send({ name: 'Jane Doe', email: 'jane@doe', country_id: 2 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jane Doe');
    expect(res.body.country_id).toBe(2);
    expect(res.body.email).toBe('jane@doe');
  });
});
