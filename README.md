# Test DSM (Data Source Manager)

## Overview

The Test DSM (Data Source Manager) is a JavaScript library designed to manage data sources in a test environment. It provides a framework for creating, managing, and destroying data source instances, allowing for efficient testing and resource management.
This library is particularly useful if you run integration tests that are use real data sources like databases and you need to run them in parallel.

Running integration tests in parallel can be challenging, especially when multiple tests need to access the same data source because tests can interfere with each other, leading to inconsistent results. For example, if one test modifies the data in a database while another test is reading from it, the second test may not get the expected results. This can make it difficult to determine whether a test has failed due to a bug in the code or due to interference from another test.
To mitigate this, you can use a data source manager to create separate instances of the data source for each test. This way, each test has its own isolated environment, reducing the risk of interference and ensuring that tests can run in parallel without issues.
The Test DSM library provides a simple and flexible API for managing data sources, allowing you to create, destroy, and manage data source instances with ease.

## Installation
To install the Test DSM library, you can use npm or yarn. Run the following command in your terminal:

```bash
npm i -D test-dsm
```
or

```bash
yarn add -D test-dsm
```

## Usage

The library provides two main components:
- producer
- consumer

### Producer

You need to initialize the producer with a data source instance provider inside your test runner's global setup. What the producer does is to initialize a basic queue server and initialize the given data source instance providers (let's call it 'feeder'). The producer will be responsible for creating the data source instances and feeding them to the consumer through the queue server. Queue Server and Feeder are basically two child processes forked by the producer.

Example with TypeScript with Jest:

Assuming your global setup file is `jest.globalSetup.ts`, you can initialize the producer in `jest.globalSetup.ts` like this:

```typescript
import { producer } from 'test-dsm';

await producer.init(path.resolve(__dirname, 'dataSources.ts'), {
  transpiler: 'ts-node/register',
});
```

This example assumes that you have a file called `dataSources.ts` in the same directory. The `dataSources.ts` file should export a function that returns an array of data source instance providers. Please refer to the [Data Source Instance Provider](#data-source-instance-provider) section for more details.

You need `ts-node` to be installed as a dev dependency if you are using TypeScript.

You should also terminate the producer in your global teardown file. This is important to ensure that all data source instances are properly cleaned up and that the queue server is terminated. You can do this in `jest.globalTeardown.ts` like this:

```typescript
import { producer } from 'test-dsm';
await producer.terminate();
```

This will ensure that all data source instances are properly cleaned up and that the queue server is terminated.

#### Queue Server

The queue server is a simple in-memory queue that allows the producer to send data source instances to the consumer. It is a basic HTTP server. The queue server is responsible for managing the communication between the producer and consumer. You don't need to interact with the queue server directly, as the producer and consumer will handle it for you. You can still customize the host and port of the queue server by setting the following environment variables:

```
DATA_SOURCE_QUEUE_HOST  # default: localhost
DATA_SOURCE_QUEUE_PORT  # default: 8765
```

#### Data Source Instance Provider

You need to pass a data source module to the producer. The data source module should export a function called `getDataSources` that returns an array of data source instance providers.

Each array item (data source instance provider) should have the following properties:

##### Data Source Parameters

| Parameter Name | Description | Type | Optional | Default Value |
|----------------|-------------|------|----------|---------------|
| `setupDataSource` | The data source to be used. | function | true | `Promise.resolve` |
| `createDataSourceInstances` | Function to create data source instances. | function | false | |
| `dataSourceQueueName` | The name of the data source queue. | string | false | |
| `initialDataSourceInstanceCount` | The initial number of data source instances. | number | true | 1 |
| `destroyDataSourceInstances` | Function to destroy data source instances. | function | false | |
| `feedInterval` | The interval for feeding data. | number | true | 200ms |
| `minimumRequiredDataSourceInstanceCount` | The minimum number of data source instances required. | number | true | 1 |
| `cleanupDataSource` | Function to clean up the data source. | function | true | `Promise.resolve` |


If you use TypeScript, the module exports the required type for the data source instance provider. You can use it like this:

```typescript
import { TypeDataSource } from 'test-dsm';
import { dataSourceProvider } from "./dataSourceProvider";

const dataSources: TypeDataSource[] = [
  dataSourceProvider
]

export function getDataSources(): TypeDataSource[] {
  return dataSources;
}
```

Assuming this file is called `dataSources.ts`, you can pass it to the producer like in the section [Producer](#producer).


##### Example Data Source Instance Provider

```typescript
import { getClient, initDbClient } from '../../src/clients/db';;
import { execSync } from 'child_process';
import { getDockerComposeFilePath } from './utils';
import { TypeDataSource } from 'test-dsm';

const createDataSourceInstance = async (): Promise<string> => {
  const dataSourceName = 'testdb_' + Date.now() + '_' + Math.floor(Math.random()* 10000);
  console.log('Data source created:', dataSourceName);
  return Promise.resolve(dataSourceName);
}

const removeDataSourceInstance = async (dataSourceName: string): Promise<void> => {
  console.log('Removing data source...', dataSourceName);
  await Promise.resolve();
}

export const dataSourceExample: TypeDataSource = {
  dataSourceQueueName: 'dataSourceQueue',
  setupDataSource: async () => {
    console.log('Setting up Data Source Provider...');
    return Promise.resolve();
  },
  createDataSourceInstances: async (count: number = 1) => {
    let dataSources: string[] = [];
    for (let i = 0; i < count; i++) {
      const dataSource = await createDataSourceInstance();
      dataSources.push(dataSource);
    }
    return dataSources;
  },
  initialDataSourceInstanceCount: 10,
  destroyDataSourceInstances: async (dataSourceInstanceNames: string[]) => {
    for (let i = 0; i < dataSourceInstanceNames.length; i++) {
      await removeDataSourceInstance(dataSourceInstanceNames[i]);
    }
  },
  cleanupDataSource: async () => {
    console.log('Cleaning up Data Source Provider...');
    return Promise.resolve();
  },
  feedInterval: 200,
  minimumRequiredDataSourceInstanceCount: 10,
}
```

You can see `examples` folder for more examples of data source instance providers.

- Postgres Example: [Postgres Example](examples/typescript/test-dsm-demo/tests/setup/dataSourcePostgres.ts)


### Consumer

The consumer is responsible for consuming data source instances from the queue server. You need to initialize the consumer in your test files. The consumer will automatically connect to the queue server and start consuming data source instances. You can use the consumer in your setup and teardown (`beforeAll`, `afterAll`) to get the data source instance info and connect to it, and then let it be destroyed You can use the consumer either in a single test suite's setup function, or in, for example, `jest.setup.ts`. You can use the consumer like this:

```typescript

import { consumer } from 'test-dsm';
import { dataSourceExample } from './dataSourceExample';
import { startTestServer, stopTestServer } from './testServer';

let dataSources: string[] = [];

beforeAll(async () => {
  console.log('Starting test server...');
  dataSources = await consumer.dequeueToUse(dataSourceExample, 1)

  const [dataSource] = dataSources;

  console.log('Initializing test server with data source:', dataSource);
 
  await startTestServer({ dataSource });
});

afterAll(async () => {
  console.log('Stopping test server...');
  await stopTestServer();
  await consumer.enqueueToDestroy(dataSourceExample, dataSources)
});

```
