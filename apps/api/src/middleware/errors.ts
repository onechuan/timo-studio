import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { DomainError } from '@timotv/core';
import { HTTPException } from 'hono/http-exception';
export const errors: ErrorHandler = (error, c) => {
  if (error instanceof ZodError)
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求数据不合法',
          details: error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
      },
      400,
    );
  if (error instanceof DomainError)
    return c.json(
      { error: { code: error.code, message: error.message } },
      error.status as 400,
    );
  if (error instanceof SyntaxError)
    return c.json(
      { error: { code: 'INVALID_JSON', message: '请求必须为合法 JSON' } },
      400,
    );
  if (error instanceof HTTPException)
    return c.json(
      { error: { code: 'HTTP_ERROR', message: error.message } },
      error.status,
    );
  // Never serialize driver errors: connection strings can contain credentials.
  return c.json(
    {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: '数据库或队列不可用，请检查服务配置和连接',
      },
    },
    503,
  );
};
