export type TypeDataSource = {
  setupDataSource?: () => Promise<void>; // default () => Promise.resolve()
  createDataSourceInstances: (count?: number) => Promise<string[]>;
  dataSourceQueueName: string;
  initialDataSourceInstanceCount?: number; // default 1
  destroyDataSourceInstances: (dataSourceInstanceNames: string[]) => Promise<void>;
  feedInterval?: number; // default 200ms
  minimumRequiredDataSourceInstanceCount?: number; // default 1
  cleanupDataSource?: () => Promise<void>; // default () => Promise.resolve()
}
