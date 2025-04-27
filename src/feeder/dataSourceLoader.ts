import { TypeDataSource } from '../@types/dataSource';
import { createLogger } from '../utils/logger';
import * as path from 'path';

const log = createLogger('feeder');

// Helper to safely require a module
const safeRequireSync = (moduleName: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(moduleName);
  } catch (err) {
    log(`Cannot load transpiler: ${moduleName}`);
    log(`Please install it: npm install ${moduleName}`);
    process.exit(1);
  }
}

const importDataSourceModule = async (dataSourcesModulePath: string, transpiler: string) => {
  try {
    safeRequireSync(transpiler);
    
    const absUserModulePath = path.resolve(dataSourcesModulePath);

   // Use `require` instead of `import` after loading ts-node/register
   // eslint-disable-next-line @typescript-eslint/no-require-imports
   const moduleToRun = require(absUserModulePath);

    return moduleToRun;
  } catch (error) {
    console.error('Error importing data sources module:', error);
    throw error;
  }
}


const initializeDataSources = async (dataSourcesModulePath: string,  transpiler: string): Promise<TypeDataSource[]> => {
  const dataSourcesModule = await importDataSourceModule(dataSourcesModulePath,  transpiler);
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
}
