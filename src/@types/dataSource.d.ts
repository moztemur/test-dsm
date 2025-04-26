export type TypeDataSource = {
  setupDataSource: () => Promise<void>;
  createDataSourceInstances: (count?: number) => Promise<string[]>;
  dataSourceQueueName: string;
  initialDataSourceInstanceCount: number;
  destroyDataSourceInstances: (dataSourceInstanceNames: string[]) => Promise<void>;
  feedInterval: number;
  minimumRequiredDataSourceInstanceCount: number;
  cleanupDataSource: () => Promise<void>;
}
