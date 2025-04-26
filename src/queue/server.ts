// server.ts
import http from 'http';
import { enqueue, dequeue, queueSize } from './store';
import { createLogger } from '../utils/logger';

const log = createLogger('queue-server');

const parseBody = async (req: http.IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();
  return body ? JSON.parse(body) : {};
};

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  log(`Received ${method} request for ${url}`);

  const match = url?.match(/^\/(enqueue|dequeue|size)\/([^/]+)$/);
  if (!match) {
    res.writeHead(404).end('Not Found');
    return;
  }

  const action = match[1];
  const queueName = decodeURIComponent(match[2]);

  if (method === 'POST' && action === 'enqueue') {
    const { items } = await parseBody(req);
    if (!Array.isArray(items)) {
      res.writeHead(400).end('Missing or invalid items array');
      return;
    }
    await enqueue(queueName, items);
    res.writeHead(200).end('Enqueued');
  }

  else if (method === 'POST' && action === 'dequeue') {
    const { count, timeoutMs } = await parseBody(req);
    if (typeof count !== 'number') {
      res.writeHead(400).end('Missing or invalid count');
      return;
    }
    const result = await dequeue(queueName, count, timeoutMs ?? 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  }

  else if (method === 'GET' && action === 'size') {
    const size = await queueSize(queueName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ size }));
  }

  else {
    res.writeHead(405).end('Method Not Allowed');
  }
});

const port = process.argv[2];

log(`Starting queue server on port ${port}`);

server.listen(port, () => {
  log(`Queue server running at http://localhost:${port}`);
  process.send?.('READY')
});
