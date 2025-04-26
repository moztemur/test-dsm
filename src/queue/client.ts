import http from 'http';
import { getDataSourceQueueHostPort } from './util';

type Enqueue = (queueName: string, items: any[]) => Promise<void>
type Dequeue = <T = any>(queueName: string, count: number, timeoutMs?: number) => Promise<T[]>
type QueueSize = (queueName: string) => Promise<number>

const { hostname, port } = getDataSourceQueueHostPort()

const request = <T = any>(method: string, path: string, body?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options: http.RequestOptions = {
      method,
      hostname,
      port,
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => (responseBody += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Error ${res.statusCode}: ${responseBody}`));
        } else {
          try {
            const parsed = JSON.parse(responseBody || 'null');
            resolve(parsed);
          } catch {
            resolve(responseBody as any); // for plain text responses
          }
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export const enqueue: Enqueue = async (queueName, items) =>{
  await request('POST', `/enqueue/${encodeURIComponent(queueName)}`, { items });
}

export const dequeue: Dequeue = (queueName, count, timeoutMs = 0) => {
  return request('POST', `/dequeue/${encodeURIComponent(queueName)}`, { count, timeoutMs });
}

export const queueSize: QueueSize = async (queueName) => {
  const res = await request<{ size: number }>('GET', `/size/${encodeURIComponent(queueName)}`);
  return res.size;
}
