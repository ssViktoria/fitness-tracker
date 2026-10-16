import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "fitpulse:offline-queue:v1";

export const MAX_ATTEMPTS = 5;

export type QueuedOp = {
  id: string;
  fn: string;
  args: Record<string, unknown>;
  createdAt: number;
  attempts: number;
};

type Listener = (size: number) => void;

const listeners = new Set<Listener>();
let cache: QueuedOp[] | null = null;
let chain: Promise<unknown> = Promise.resolve();

function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job, job);
  chain = run.catch(() => {});
  return run;
}

async function read(): Promise<QueuedOp[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function write(queue: QueuedOp[]) {
  cache = queue;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
  }
  listeners.forEach((l) => l(queue.length));
}

export const getQueue = () => serial(read);

export const enqueue = (fn: string, args: Record<string, unknown>) =>
  serial(async () => {
    const queue = await read();
    await write([
      ...queue,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fn,
        args,
        createdAt: Date.now(),
        attempts: 0,
      },
    ]);
  });

export const removeOp = (id: string) =>
  serial(async () => {
    const queue = await read();
    await write(queue.filter((op) => op.id !== id));
  });

export const bumpAttempts = (id: string) =>
  serial(async () => {
    const queue = await read();
    await write(queue.map((op) => (op.id === id ? { ...op, attempts: op.attempts + 1 } : op)));
  });
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}