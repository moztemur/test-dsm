import 'dotenv/config'
import { getClient, initDbClient } from '../../src/clients/db';;
import { execSync } from 'child_process';
import { getDockerComposeFilePath } from './utils';
import { TypeDataSource } from 'test-dsm';

const makeDbTemplate = async () => {
  console.log('Creating database template...', getClient().database);

  await getClient().query(
    `ALTER DATABASE ${getClient().database} IS_TEMPLATE TRUE;`,
  );
}

const createDb = async (): Promise<string> => {
  const dbName = 'testdb_' + Date.now() + '_' + Math.floor(Math.random()* 10000);
  console.log('Creating database...', dbName);
  await getClient().query(
    `CREATE DATABASE ${dbName} WITH TEMPLATE ${getClient().database};`,
  );

  console.log('Database created:', dbName);

  return dbName;
}

const dropDb = async (dbName: string): Promise<void> => {
  console.log('Dropping database...', dbName);
  await getClient().query(
    `DROP DATABASE ${dbName};`,
  );
}

export const dataSourcePostgres: TypeDataSource = {
  dataSourceQueueName: 'postgres',
  setupDataSource: async () => {
    const dockerComposeFilePath = getDockerComposeFilePath();

    console.log('Starting PostgreSQL container...');
    execSync(`docker compose -f ${dockerComposeFilePath} up -d postgres`, { stdio: 'inherit' });
  
    console.log('Running migration script...');
    execSync('npm run migrate', { stdio: 'inherit' });

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
    await makeDbTemplate();
  },
  createDataSourceInstances: async (count: number = 1) => {
    // have to be serial since postgres does not allow to create databases from template in parallel
    let databases: string[] = [];
    for (let i = 0; i < count; i++) {
      const database = await createDb();
      databases.push(database);
    }
    return databases;
  },
  initialDataSourceInstanceCount: 10,
  destroyDataSourceInstances: async (dataSourceInstanceNames: string[]) => {
    for (let i = 0; i < dataSourceInstanceNames.length; i++) {
      await dropDb(dataSourceInstanceNames[i]);
    }
  },
  cleanupDataSource: async () => {
    console.log('Stopping PostgreSQL container...');
    execSync(`docker compose -f ${getDockerComposeFilePath()} down -v`, { stdio: 'inherit' });
  },
  feedInterval: 200,
  minimumRequiredDataSourceInstanceCount: 10,
}

