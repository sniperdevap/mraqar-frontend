import { z } from 'zod';

export const vinLookupSchema = z.object({
  vin: z
    .string()
    .trim()
    .length(17, 'VIN must be exactly 17 characters')
    .regex(/^[A-HJ-NPR-Z0-9]+$/i, 'VIN can only contain letters and numbers'),
  part: z.string().min(1, 'Part is required'),
});

export const ymmLookupSchema = z.object({
  year: z
    .string()
    .trim()
    .regex(/^(19\d{2}|20\d{2})$/, 'Enter a valid year')
    .min(4, 'Year is required'),
  make: z
    .string()
    .trim()
    .min(1, 'Make is required')
    .max(50, 'Make must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Make can only contain letters, numbers, and hyphens'),
  model: z
    .string()
    .trim()
    .min(1, 'Model is required')
    .max(50, 'Model must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Model can only contain letters, numbers, and hyphens'),
  part: z.string().min(1, 'Part is required'),
});

export const serviceLineValidationSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(1, 'Service name is required')
    .min(3, 'Service name must be at least 3 characters')
    .max(60, 'Service name must not exceed 60 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Service name can only contain letters and spaces'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  price: z
    .string()
    .min(1, 'Listed price is required')
    .max(20, 'Listed price must not exceed 20 characters')
    .refine(
      val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          return false;
        }
        if (num < 0) {
          return false;
        }
        return true;
      },
      {
        message: 'Listed price must be a positive number',
      }
    ),
});

export const customerDetailsValidationSchema = z.object({
  name: z.string().refine(
    val => {
      // If name is empty, it's valid (optional)
      if (!val || val.trim() === '') {
        return true;
      }
      // If provided, must be at least 2 characters
      return val.trim().length >= 2;
    },
    {
      message: 'Name must be at least 2 characters',
    }
  ),
  phone: z.string().refine(
    val => {
      // If phone is empty, it's valid (optional)
      if (!val || val.trim() === '') {
        return true;
      }
      // Remove spaces, dashes, parentheses, dots, and plus signs for validation
      const cleaned = val.replace(/[\s\-\(\)\.\+]/g, '');
      // Remove optional leading 1 (country code for Canada/US)
      const withoutCountryCode = cleaned.startsWith('1') && cleaned.length === 11 ? cleaned.slice(1) : cleaned;
      // Check if it's exactly 10 digits (Canadian phone number format)
      return /^\d{10}$/.test(withoutCountryCode);
    },
    {
      message: 'Phone number must be a valid format.',
    }
  ),
  email: z.string().refine(
    val => {
      // If email is empty, it's valid (optional)
      if (!val || val.trim() === '') {
        return true;
      }
      // If provided, must be a valid email
      return z.string().email().safeParse(val).success;
    },
    {
      message: 'Invalid email address',
    }
  ),
});

export type VinLookupInput = z.infer<typeof vinLookupSchema>;
export type YMMLookupInput = z.infer<typeof ymmLookupSchema>;
export type ServiceLineInput = z.infer<typeof serviceLineValidationSchema>;
export type CustomerDetailsInput = z.infer<typeof customerDetailsValidationSchema>;
