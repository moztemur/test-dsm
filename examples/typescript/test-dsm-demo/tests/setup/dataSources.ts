import { dataSourcePostgres } from "./dataSourcePostgres";

const dataSources = [
  dataSourcePostgres
]

export function getDataSources() {
  return dataSources
}
