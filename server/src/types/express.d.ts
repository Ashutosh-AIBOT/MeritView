import { User, Dispute, Party, Brief, EvaluationJob, EvaluatorOutput, Opinion, Payment, AuditEvent } from '@meritview/shared';

declare global {
  namespace Express {
    export interface Request {
      requestId?: string;
      user?: {
        id: string;
        email: string;
        role: 'standard' | 'admin' | 'support';
      };
      validated?: any;
    }
  }
}

export {};
