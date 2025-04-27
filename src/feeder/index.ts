import { initializeDataSources } from './dataSourceLoader';
import * as queueClient from '../queue/client';
import { getDestroyQueueName } from '../queue/util';
import { TypeDataSource } from '../@types/dataSource';
import { createLogger } from '../utils/logger';

const log = createLogger('feeder');

let dataSources = [] as TypeDataSource[];

let isShuttingDown = false;

const feedDataSourceQueueByIntervals = async (dataSource: TypeDataSource) => {
  while (true) {
    if (isShuttingDown) {
      log('shutting down, exiting feeder loop');
      break;
    }

    await createAndAddDataSourcesToQueue(dataSource, 1);
 
    await getAndDestroyDataSourceFromQueue(dataSource);

    let feedInterval = dataSource.feedInterval || 200;
    await new Promise(resolve => setTimeout(resolve, feedInterval));
  }
}

const createAndAddDataSourcesToQueue = async (
  dataSource: TypeDataSource,
  dataSourceCountToCreate: number,
) => {
  const { dataSourceQueueName, createDataSourceInstances } = dataSource;
  const count = await queueClient.queueSize(dataSourceQueueName);

  let minimumRequiredDataSourceInstanceCount = dataSource.minimumRequiredDataSourceInstanceCount || 1;

  if (count < minimumRequiredDataSourceInstanceCount) {
    log(`data source count is less than threshold, adding 1 more: ${count} < ${minimumRequiredDataSourceInstanceCount}`);

    const dataSources = await createDataSourceInstances(dataSourceCountToCreate);
    if (dataSources.length === 0) {
      return;
    }
    log('creating and adding data sources to queue', dataSources);
    await queueClient.enqueue(dataSourceQueueName, dataSources);
  }
};

const getAndDestroyDataSourceFromQueue = async (
  dataSource: TypeDataSource,
) => {
  const { dataSourceQueueName, destroyDataSourceInstances } = dataSource;
  const dataSourceDestroyQueueName = getDestroyQueueName(dataSourceQueueName);
  const dataSources = await queueClient.dequeue(dataSourceDestroyQueueName, 1, 1);
  await destroyDataSourceInstances(dataSources);
};

const initDataSourceFeeder = async () => {
  if (!dataSources || dataSources.length === 0) {
    throw new Error('Data Sources not initialized');
  }

  await Promise.all(dataSources.map(async (dataSource) => {
    log(`creating data source ${dataSource}`);
    let dataSourceSetup = dataSource.setupDataSource || (() => Promise.resolve());
    await dataSourceSetup();

    let initialDataSourceInstanceCount = dataSource.initialDataSourceInstanceCount || 1;
    log(`creating initial data source instances ${initialDataSourceInstanceCount}`);

    await createAndAddDataSourcesToQueue(dataSource, initialDataSourceInstanceCount);

    feedDataSourceQueueByIntervals(dataSource)
  }));
}

const terminateDataSourceFeeder = async () => {
  await Promise.all(dataSources.map(async (dataSource) => {
    let dataSourceCleanup = dataSource.cleanupDataSource || (() => Promise.resolve());
    await dataSourceCleanup();
  }));
}

(async () => {
  const [,,dataSourcesModulePath, transpiler] = process.argv as string[];
  dataSources = await initializeDataSources(dataSourcesModulePath, transpiler);
  await initDataSourceFeeder();
  process.send?.('READY')
})();

process.on('SIGTERM', async () => {
  isShuttingDown = true;
  log('SIGTERM signal received: closing data source producer');
  await terminateDataSourceFeeder();
  log('Data source producer closed');
  process.exit(0);
});
