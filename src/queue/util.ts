const getDestroyQueueName = (dataSourceQueueName: string): string => {
  return dataSourceQueueName + '_destroy'
}

const getDataSourceQueueHostPort = () => {
  return {
    port: process.env.DATA_SOURCE_QUEUE_PORT || 8765,
    hostname: process.env.DATA_SOURCE_QUEUE_HOST || 'localhost',
    enableQueueDashboard: process.env.ENABLE_QUEUE_DASHBOARD === 'true',
    dashboardServerPort: process.env.QUEUE_DASHBOARD_PORT || 8760,
  }
}

export { getDestroyQueueName, getDataSourceQueueHostPort }
