import { z } from 'zod';

// Password validation helper
export const passwordSchema = z.string().min(1, 'Password is required');

// Login form validation schema
export const loginValidationSchema = z.object({
  phoneNumber: z.string().regex(/^\d{8}$/, 'Enter the 8-digit Kuwait number').trim(),
  password: z.string().min(1, 'Password is required'),
});

// Signup form validation schema
export const signupValidationSchema = z
  .object({
    accountType: z.enum(['individual', 'office']),
    userType: z.enum(['personal', 'owner', 'marketer']).optional(),
    licenseNumber: z.string().trim().optional(),
    name: z.string().min(1, 'Name is required').trim(),
    phoneNumber: z.string().regex(/^\d{8}$/, 'Enter the 8-digit Kuwait number').trim(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'At least 6 characters'),
    avatar: z.string().optional(),
  })
  .refine((v) => v.accountType !== 'individual' || Boolean(v.userType), { message: 'Choose one', path: ['userType'] })
  .refine((v) => v.accountType !== 'office' || Boolean(v.licenseNumber), { message: 'License number is required', path: ['licenseNumber'] });

// Forgot password validation schema
export const forgotPasswordValidationSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required').trim(),
});

// Reset password validation schema
export const resetPasswordValidationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
