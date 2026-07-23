import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.ts';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  try {
    (req as any).user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user?.admin) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  next();
}

export function requireSupport(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user?.support) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Support access required' } });
  }
  next();
}
