export {};
declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; admin?: boolean; support?: boolean };
      requestId?: string;
    }
  }
}
