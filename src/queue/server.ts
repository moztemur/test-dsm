// server.ts
import * as queuePort from 'queue-port'
import { createLogger } from '../utils/logger';

const log = createLogger('queue-server');

const port = Number(process.argv[2]);
const enableDashboardServer = process.argv[3] === 'true';
const dashboardServerPort = Number(process.argv[4]);

log(`Starting queue server on port ${port}`);

queuePort.start({
  port,
  enableDashboardServer,
  dashboardServerPort
})

setTimeout(() => {
  process.send?.('READY');
}, 1000);
