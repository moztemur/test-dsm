import { ChildProcess, fork } from "child_process";

const createChildProcess = (modulePath: string, args: string[]): Promise<ChildProcess> => {
  const ext = process.env.TS_DEV ? '.ts' : '.js';
  const execArgv = process.env.TS_DEV ? ['-r', 'ts-node/register'] : undefined;

  return new Promise((resolve => {
    const child = fork(modulePath + ext, args, {
      execArgv
    });
    child.on('message', (msg) => {
      if (msg === 'READY') {
        resolve(child);
      }
    });
  }
  ));
}

export {
  createChildProcess,
}
