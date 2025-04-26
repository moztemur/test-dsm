// queueModule.ts
type QueueItem = any;
type Queue = QueueItem[];
type Queues = Map<string, Queue>;
type Timer = ReturnType<typeof setTimeout>
type Waiter = {
  resolve: () => void;
  timeout: Timer;
};

const queues: Queues = new Map();
const waiters: Map<string, Waiter[]> = new Map();

export function enqueue(queueName: string, items: QueueItem[]): void {
  const queue = queues.get(queueName);
  if (queue) {
    queue.push(...items);
    queues.set(queueName, queue);

  } else {
    queues.set(queueName, items);
  }

  const queueWaiters = waiters.get(queueName);
  if (queueWaiters?.length) {
    queueWaiters.forEach(w => {
      if (w.timeout) clearTimeout(w.timeout);
      w.resolve();
    });
    waiters.set(queueName, []);
  }
}

export async function dequeue(queueName: string, count: number, timeoutMs: number): Promise<QueueItem[]> {
  let queue = queues.get(queueName) ?? [];

  if (queue.length === 0) {
    // Wait until items are available or timeout (if timeoutMs > 0)
    await new Promise<void>((resolve) => {
      let timer: Timer | null = null;

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          resolve(); // resolve after timeout
        }, timeoutMs);
      }

      const qWaiters = waiters.get(queueName) ?? [];
      qWaiters.push({ resolve, timeout: timer as Timer });
      waiters.set(queueName, qWaiters);
    });

    queue = queues.get(queueName) ?? [];
  }

  const items = queue.splice(0, count);
  queues.set(queueName, queue);
  return items;
}

export function queueSize(queueName: string): number {
  const queue = queues.get(queueName) ?? [];
  return queue.length;
}
