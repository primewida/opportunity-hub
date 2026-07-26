import { z } from 'zod';
import { OPPORTUNITY_TYPES, EDUCATION_LEVELS } from '../utils/constants.js';

export const queryOpportunitiesSchema = z.object({
  type: z.enum(OPPORTUNITY_TYPES).optional(),
  educationLevel: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  minMatch: z.coerce.number().min(0).max(100).optional(),
  deadlineBefore: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(20)
});
