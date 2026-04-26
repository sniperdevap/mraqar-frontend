import { z } from 'zod';

export const teamMemberValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Enter full name')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z.string().trim().min(1, 'Email is required').max(255, 'Email address must not exceed 255 characters').email('Invalid email address'),
  canEditQuoteServiceLineItem: z.boolean(),
});

export type TeamMemberInput = z.infer<typeof teamMemberValidationSchema>;
