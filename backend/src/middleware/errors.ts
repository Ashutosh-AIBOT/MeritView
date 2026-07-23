import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  res.status(status).json({
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message: err.message ?? 'Something went wrong',
      details: err.details ?? {},
      request_id: (req as any).requestId,
      documentation_url: 'https://docs.meritview.app/errors/',
    },
  });
}
