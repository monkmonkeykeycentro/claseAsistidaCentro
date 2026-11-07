export function safeErrorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  return typeof code === 'string' && /^[a-z][a-z0-9/-]{0,64}$/.test(code) ? code : 'unknown-error';
}
export function logSafeError(context: string, error: unknown): void {
  // SDK error objects can include OAuth responses, email addresses and tokens.
  console.warn(context, safeErrorCode(error));
}
