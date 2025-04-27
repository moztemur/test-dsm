# Test DSM (Data Source Manager)

## Creating Data Source Instance Provider

### Data Source Parameters

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

### Example Data Source Instance Provider

TBD
