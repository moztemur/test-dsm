import { producer } from 'test-dsm';
import path from 'path';

export default async () => {
  console.log('Initializing data source manager...');

  await producer.init(path.resolve(__dirname, 'dataSources.ts'), {
    transpiler: 'ts-node/register',
  });
  console.log('Data source manager initialized');
};
