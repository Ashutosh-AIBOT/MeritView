import { z } from 'zod';

export const disputeCreateSchema = z.object({
  category: z.literal('contract_interpretation'),
  title: z.string().min(5).max(200),
  summary: z.string().max(500).optional(),
  estimated_stakes_usd: z.number().positive().optional(),
});

export const briefSectionsSchema = z.object({
  factual_background: z.string().min(1),
  my_position: z.string().min(1),
  supporting_arguments: z.string().min(1),
  acknowledgment_of_opposing: z.string().min(1),
  desired_resolution: z.string().min(1),
});
