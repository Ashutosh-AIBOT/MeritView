import { NextApiRequest, NextApiResponse } from 'next';
export type ApiResponse<T = any> = {
  data?: T;
  error?: { code: string; message: string; details?: any };
};

export function success<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json({ data } as ApiResponse<T>);
}

export function fail(res: NextApiResponse, code: string, message: string, status = 400, details?: any) {
  return res.status(status).json({ error: { code, message, details } } as ApiResponse);
}
