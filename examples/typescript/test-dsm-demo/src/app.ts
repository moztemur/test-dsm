import express, { Router } from 'express';
import { getPool } from './clients/db';

const app = express();

app.use(express.json());

const router = Router();

router.get('/', async (req, res) => {
  const result = await getPool().query(`
      SELECT users.*, countries.name AS country_name
      FROM users
      LEFT JOIN countries ON users.country_id = countries.id
    `);
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, email, country_id } = req.body;
  const result = await getPool().query(
    'INSERT INTO users (name, email, country_id) VALUES ($1, $2, $3) RETURNING *',
    [name, email, country_id]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, country_id } = req.body;
  const result = await getPool().query(
    'UPDATE users SET name = $1, email = $2, country_id = $3 WHERE id = $4 RETURNING *',
    [name, email, country_id, id]
  );
  res.json(req.body);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await getPool().query('DELETE FROM users WHERE id = $1', [id]);
  res.status(204).send();
});

app.use('/users', router);

export default app;
