export function redact(obj: Record<string, unknown>, keys: string[] = ['password', 'token', 'secret']) {
  const clone = { ...obj };
  for (const k of keys) if (k in clone) clone[k] = '[REDACTED]';
  return clone;
}
