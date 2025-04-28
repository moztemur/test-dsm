import 'dotenv/config'
import { closeClient, getClient, initDbClient } from '../clients/db';


initDbClient({
  // @ts-ignore
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  // @ts-ignore
  user: process.env.POSTGRES_USER,
  // @ts-ignore
  password: process.env.POSTGRES_PASSWORD,
  // @ts-ignore
  database: process.env.POSTGRES_DB,
});

const createTables = async () => {
  try {
    // Create countries table
    await getClient().query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

    // Insert default countries
    await getClient().query(`
      INSERT INTO countries (name)
      VALUES ('USA'), ('Canada'), ('Germany'), ('France')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create users table with a foreign key to countries
    await getClient().query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        country_id INT REFERENCES countries(id) ON DELETE SET NULL
      );
    `);

    console.log('Tables created and default data inserted successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await closeClient();
  }
};

createTables();
