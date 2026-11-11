export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const attempts = (options.method ?? 'GET').toUpperCase() === 'GET' ? 3 : 1;
  const signal = options.signal ?? AbortSignal.timeout(10000);
  const unavailable = '服务暂时无法连接，请稍后重试';
  for (let attempt = 0; attempt < attempts; attempt++) {
    signal.throwIfAborted();
    let response: Response | undefined;
    try {
      response = await fetch('/api' + path, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
        signal,
      });
    } catch {
      if (signal.aborted || attempt === attempts - 1)
        throw new Error(unavailable);
    }
    if (response) {
      const body = await response.json().catch(() => null);
      if (response.ok) return body as T;
      // Preserve actionable API errors; only retry unstructured proxy failures.
      if (typeof body?.error?.message === 'string')
        throw new Error(body.error.message);
      if (![500, 502, 503, 504].includes(response.status))
        throw new Error(`请求失败 (${response.status})`);
      if (attempt === attempts - 1) throw new Error(unavailable);
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw new Error(unavailable);
}
