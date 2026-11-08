export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api' + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error('无法连接服务，请检查 API 是否启动');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error?.message ?? `请求失败 (${response.status})`);
  return body as T;
}
