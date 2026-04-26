import { z } from 'zod';
import { passwordSchema } from './auth';

// Account info validation schema
export const accountInfoValidationSchema = z
  .object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const passwordUpdateValidationSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Subscription plan validation schema
export const subscriptionPlanValidationSchema = z.object({
  subscriptionAmount: z
    .string()
    .min(1, 'Subscription amount is required')
    .refine(
      val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Subscription amount must be a valid number' }
    ),
});

// App settings validation schema
export const appSettingsValidationSchema = z.object({
  vinSearchLimit: z
    .string()
    .min(1, 'VIN search limit is required')
    .refine(
      val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 1;
      },
      { message: 'VIN search limit must be a valid number and at least 1' }
    ),
  chargePerRequest: z
    .string()
    .min(1, 'Charge per request is required')
    .refine(
      val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Charge per request must be a valid number' }
    ),
});
