const transientModelFailures = new Set(['MODEL_TIMEOUT', 'MODEL_CONNECTION']);

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('MODEL_CANCELLED'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error('MODEL_CANCELLED'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Retry only failures that produced no result and are likely transient. */
export async function withModelRetry<T>(
  operation: () => Promise<T>,
  signal?: AbortSignal,
  { retries = 1, delayMs = 1500 }: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (
        attempt >= retries ||
        signal?.aborted ||
        !transientModelFailures.has(code)
      )
        throw error;
      await sleep(delayMs, signal);
    }
  }
}
