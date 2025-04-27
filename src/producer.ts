import { ChildProcess } from 'child_process';
import path from 'path';
import { getDataSourceQueueHostPort } from './queue/util';
import { createChildProcess } from './utils/childproc';
import { createLogger } from './utils/logger';

const log = createLogger('producer');

let feeder: ChildProcess;
let queueServer: ChildProcess;

const init = async (dataSourcesModulePath: string, options: {
  transpiler: string
} = {
  transpiler: 'ts-node/register',
}) => {
  log('init data source producer')
  const { port } = getDataSourceQueueHostPort()
  const queueServerPortString = port + '';
  queueServer = await createChildProcess(path.resolve(__dirname, 'queue/server'),
    [queueServerPortString]);

  feeder = await createChildProcess(path.resolve(__dirname, 'feeder/index'), [dataSourcesModulePath, options.transpiler]);
}

const terminate = () => {
  if (feeder) {
    feeder.kill();
    log('feeder process terminated');
  } else {
    log('No feeder process to terminate');
  }

  if (queueServer) {
    queueServer.kill();
    log('queue server process terminated');
  } else {
    log('No queue server process to terminate');
  }
}

export {
  init, terminate
}
