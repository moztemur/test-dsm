import { Pool, Client } from 'pg';

let pool: Pool | null = null;
let client: Client | null = null;

type TypeDbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;

}

const initDbPool = async (dbConfig: TypeDbConfig) => {
  console.log('initializing database', dbConfig, pool)
  if (!pool) {
    pool = createConnectionPool(dbConfig);
  }

  return pool;
}


const initDbClient = async (dbConfig: TypeDbConfig) => {
  console.log('initializing database', dbConfig, pool)
  if (!client) {
    client = new Client(dbConfig);
    await client.connect();
  }

  return client;
}


const createConnectionPool = (dbConfig: TypeDbConfig) => {
  const pool = new Pool(dbConfig);

  return pool;
}

const getPool = () => {
  if (!pool) {
    throw new Error('Database connection pool is not initialized. Call initDb() first.');
  }
  return pool;
}

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

const getClient = () => {
  if (!client) {
    throw new Error('Database client is not initialized. Call initDb() first.');
  }
  return client;
}

const closeClient = async () => {
  if (client) {
    await client.end();
    client = null;
  }
}

export { initDbClient, initDbPool, getPool, getClient, closeClient, closePool}
