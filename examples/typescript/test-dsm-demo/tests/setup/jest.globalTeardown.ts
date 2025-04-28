import { producer } from 'test-dsm';

export default async () => {
  producer.terminate();
};
