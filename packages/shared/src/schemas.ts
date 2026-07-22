import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).regex(/[A-Za-z]/, 'Must contain at least one letter').regex(/[0-9]/, 'Must contain at least one number'),
  display_name: z.string().max(100).optional(),
  accept_terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const disputeCreateSchema = z.object({
  category: z.literal('contract_interpretation'),
  title: z.string().min(5).max(200),
  summary: z.string().max(500).optional(),
  estimated_stakes_usd: z.number().positive().optional(),
});

export const briefSubmitSchema = z.object({
  factual_background: z.string().min(1).max(5000),
  my_position: z.string().min(1).max(5000),
  supporting_arguments: z.string().min(1).max(5000),
  acknowledgment_of_opposing: z.string().min(1).max(5000),
  desired_resolution: z.string().min(1).max(5000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DisputeCreateInput = z.infer<typeof disputeCreateSchema>;
export type BriefSubmitInput = z.infer<typeof briefSubmitSchema>;
