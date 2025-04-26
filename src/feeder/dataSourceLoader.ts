import { TypeDataSource } from '../@types/dataSource';
import { createLogger } from '../utils/logger';
import { importTsModule } from '../utils/tsutilPrivate';

const log = createLogger('feeder');

const importDataSourceModule = async (dataSourcesModulePath: string, dataSourceImporter: DataSourceImporter) => {
  let dataSourceModule = await dataSourceImporter(dataSourcesModulePath);

  log('data source module', dataSourceModule);
  return dataSourceModule;
}

const getDataSourceImporter = (dataSourcesModulePath: string, compilerOptions: object) => {
  let dataSourceImporter;
  if (dataSourcesModulePath.endsWith('.ts')) {
    dataSourceImporter = (modulePath: string) => importTsModule(modulePath, compilerOptions);
  } else {
    dataSourceImporter = (modulePath: string) => import(modulePath);
  }
  return dataSourceImporter;
}

const initializeDataSources = async (dataSourcesModulePath: string, dataSourceImporter: DataSourceImporter): Promise<TypeDataSource[]> => {
  const dataSourcesModule = await importDataSourceModule(dataSourcesModulePath, dataSourceImporter);
  log('data sources module', dataSourcesModule);
  if (dataSourcesModule === undefined) {
    throw new Error('dataSourcesModule not found in path:' + dataSourcesModulePath)
  }

  if (!dataSourcesModule.getDataSources) {
    throw new Error('dataSourcesModule has to export getDataSources function that returns dataSources')
  }

  return dataSourcesModule.getDataSources();
}

export {
  initializeDataSources,
  getDataSourceImporter,
}
