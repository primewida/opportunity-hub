import { z } from 'zod';

export const queryJobsSchema = z.object({
  type: z.enum(['Full-time', 'Part-time', 'Internship', 'NYSC', 'Remote']).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(20)
});
