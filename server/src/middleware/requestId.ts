import { Request, Response, NextFunction } from 'express';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  (req as any).requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};
