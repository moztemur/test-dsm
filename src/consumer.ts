import { TypeDataSource } from './@types/dataSource';
import * as queueClient from './queue/client';
import { getDestroyQueueName } from './queue/util';

const dequeueToUse = async (dataSource: TypeDataSource, count: number): Promise<string[]> => {
  const dataSources = await queueClient.dequeue(dataSource.dataSourceQueueName, count, 0)
  return dataSources;
}

const enqueueToDestroy = async (dataSource: TypeDataSource, items: string[]): Promise<void> => {
   await queueClient.enqueue(getDestroyQueueName(dataSource.dataSourceQueueName), items)
}

export {
  dequeueToUse, enqueueToDestroy
}
