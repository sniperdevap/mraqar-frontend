import { z } from 'zod';

// Password validation helper
export const passwordSchema = z.string().min(1, 'Password is required');

// Login form validation schema
export const loginValidationSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

// Signup form validation schema
export const signupValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phoneNumber: z.string().min(1, 'Phone number is required').trim(),
  password: passwordSchema,
  avatar: z.string().min(1, 'Profile photo is required'),
});

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
