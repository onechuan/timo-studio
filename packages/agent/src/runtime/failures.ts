/** Only these fixed messages may cross from provider failures into persisted job errors. */
export const modelFailureMessages: Record<string, string> = {
  MODEL_AUTH_FAILED:
    '导演模型认证失败，请在服务配置页检查 API Key 和账号权限后重试',
  MODEL_BALANCE: '导演模型账户额度不足，请检查服务商余额或配额后重试',
  MODEL_RATE_LIMIT: '导演模型请求过于频繁或已达配额限制，请稍后重试',
  MODEL_NOT_FOUND:
    '导演模型或接口地址不存在，请在服务配置页检查模型 ID 和 API 地址',
  MODEL_TIMEOUT: '导演模型请求超时，请稍后重试，或缩短目标时长后重新规划',
  MODEL_CONNECTION: '无法连接导演模型服务，请检查 API 地址与网络后重试',
  MODEL_SERVICE_ERROR: '导演模型服务返回异常，请稍后重试或检查服务商状态',
  MODEL_NO_SUBMISSION:
    '导演模型没有提交分镜或口播结果，请重试；若反复出现，请使用支持工具调用的模型',
  MODEL_OUTPUT_LIMIT:
    '导演模型输出达到单次长度上限，请缩短目标时长或减少资料后重试',
  MODEL_INVALID_SUBMISSION: '导演模型提交的 JSON 不完整或格式错误，请重新生成',
  MODEL_CANCELLED: '本次模型生成已取消，请重新发起任务',
};

/** Inspect provider text privately; never return or persist the original response. */
export function providerFailureCode(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (
    /\b(?:401|403)\b|authentication|unauthorized|(?:invalid|incorrect).?api.?key/i.test(
      message,
    )
  )
    return 'MODEL_AUTH_FAILED';
  if (/\b402\b|insufficient_quota|insufficient balance|余额不足/i.test(message))
    return 'MODEL_BALANCE';
  if (/\b429\b|rate.?limit/i.test(message)) return 'MODEL_RATE_LIMIT';
  if (/\b404\b|model.?not.?found/i.test(message)) return 'MODEL_NOT_FOUND';
  if (/timed?\s*out|timeout|ETIMEDOUT/i.test(message)) return 'MODEL_TIMEOUT';
  if (/fetch failed|ECONN|ENOTFOUND|network|socket|connection/i.test(message))
    return 'MODEL_CONNECTION';
  return 'MODEL_SERVICE_ERROR';
}
