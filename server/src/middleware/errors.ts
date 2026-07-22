import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const requestId = req.requestId || 'unknown';
  console.error(`[${requestId}] Error:`, err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err.details || {},
      request_id: requestId,
      documentation_url: 'https://docs.meritview.app/errors/',
    },
  });
};
