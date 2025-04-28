import app from "../../src/app";
import { initDbPool, closePool } from "../../src/clients/db";

let testServer: any;

const startTestServer = ({ database }: {
  database: string
}) => {
  console.log('starting test server...')
  return new Promise((resolve, reject) => {
    if (!testServer) {
      initDbPool({
        // @ts-ignore
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        // @ts-ignore
        user: process.env.POSTGRES_USER,
        // @ts-ignore
        password: process.env.POSTGRES_PASSWORD,
        // @ts-ignore
        database,
      });

      testServer = app.listen(0, () => {
        // eslint-disable-next-line no-console
        console.log(`Test server is running on port ${testServer.address().port}`);
        resolve(undefined);
      });
    }
    resolve(undefined);
  });
};

const stopTestServer = async () => {
  if (testServer) {
    testServer.close();
    await closePool();
  }
};

const getTestServer = () => {
  return testServer;
};

export { startTestServer, stopTestServer, getTestServer };
