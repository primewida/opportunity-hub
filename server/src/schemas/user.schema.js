import { z } from 'zod';
import { GENDERS, NIGERIAN_STATES } from '../utils/constants.js';

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  educationLevel: z.string().optional(),
  institutionName: z.string().optional(),
  courseOfStudy: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  currentState: z.string().optional(),
  currentCity: z.string().optional(),
  jambScore: z.coerce.number().optional(),
  waecStatus: z.string().optional(),
  cgpa: z.coerce.number().min(0).max(5).optional(),
  nyscStatus: z.string().optional(),
  bio: z.string().optional(),
  careerGoals: z.string().optional(),
  phoneNumber: z.string().optional(),
  onboardingCompleted: z.boolean().optional()
}).partial();

export const profileSetupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  educationLevel: z.string(),
  institutionName: z.string().optional(),
  courseOfStudy: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.object({
    name: z.string(),
    proficiencyLevel: z.number().min(1).max(5)
  })).optional()
});

export const updateSkillsSchema = z.object({
  skills: z.array(z.object({
    name: z.string(),
    proficiencyLevel: z.number().min(1).max(5)
  }))
});

export const updateInterestsSchema = z.object({
  interests: z.array(z.string())
});
