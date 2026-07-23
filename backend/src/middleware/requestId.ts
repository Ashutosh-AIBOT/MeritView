import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = `req_${randomUUID()}`;
  res.setHeader('X-Request-Id', id);
  (req as any).requestId = id;
  next();
}
