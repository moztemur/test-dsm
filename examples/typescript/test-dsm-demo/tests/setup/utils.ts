import { join } from 'path';
import supertest from 'supertest';
import { getTestServer } from './testServer';

export const getDockerComposeFilePath = () => {
  return join(__dirname, 'docker-compose.yml');
};

export const request = () => {
  return supertest(getTestServer());
};
