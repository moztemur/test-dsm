import { consumer } from 'test-dsm';
import { getDataSources } from './dataSources';
import { startTestServer, stopTestServer } from './testServer';

let databases: string[] = [];

beforeAll(async () => {
  console.log('Starting test server...');
  const [dataSourcePostgres] = getDataSources();
  databases = await consumer.dequeueToUse(dataSourcePostgres, 1)

  const [database] = databases

  console.log('Initializing test server with database:', database);
 
  await startTestServer({ database });
});

afterAll(async () => {
  console.log('Stopping test server and closing db connections...');
  await stopTestServer();
  const [dataSourcePostgres] = getDataSources();
  await consumer.enqueueToDestroy(dataSourcePostgres, databases)
});
