const getDestroyQueueName = (dataSourceQueueName: string): string => {
  return dataSourceQueueName + '_destroy'
}

const getDataSourceQueueHostPort = () => {
  return {
    port: process.env.DATA_SOURCE_QUEUE_PORT || 8765,
    hostname: process.env.DATA_SOURCE_QUEUE_HOST || 'localhost'
  }
}

export { getDestroyQueueName, getDataSourceQueueHostPort }
