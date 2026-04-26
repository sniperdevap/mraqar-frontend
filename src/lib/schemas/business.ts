import { z } from 'zod';

export const businessInfoValidationSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(1, 'Owner name is required')
    .min(2, 'Owner name must be at least 2 characters')
    .max(50, 'Owner name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Owner name can only contain letters and spaces'),
  businessName: z.string().trim().min(1, 'Business name is required').min(2, 'Business name must be at least 2 characters').max(50, 'Business name must not exceed 50 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must not exceed 20 characters')
    .refine(
      val => {
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
  taxId: z.string().trim().min(1, 'Tax ID is required').max(20, 'Tax ID must not exceed 20 characters').regex(/^\d+$/, 'Tax ID can only contain numbers'),
  businessAddress: z.string().trim().min(1, 'Business address is required').min(5, 'Business address must be at least 5 characters').max(200, 'Business address must not exceed 200 characters'),
  logo: z
    .custom<File | undefined>(file => file === undefined || file instanceof File, { message: 'Logo must be a valid file' })
    .optional()
    .refine(
      file => {
        if (!file) {
          return true; // Optional, so undefined is valid
        }
        if (!(file instanceof File) || file.size === 0) {
          return false;
        }
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        return validTypes.includes(file.type);
      },
      {
        message: 'Logo must be a PNG or JPG image',
      }
    )
    .refine(
      file => {
        if (!file) {
          return true; // Optional, so undefined is valid
        }
        if (!(file instanceof File) || file.size === 0) {
          return false;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        return file.size <= maxSize;
      },
      {
        message: 'Logo size must be less than 5MB',
      }
    ),
});

export type BusinessInfoInput = z.infer<typeof businessInfoValidationSchema>;

export const pricingRulesValidationSchema = z
  .object({
    supplierMarkupType: z.enum(['percentage', 'amount']),
    supplierMarkupValue: z
      .string()
      .min(1, 'Supplier Markup value is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Supplier Markup must be a valid number')
      .refine(
        val => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        {
          message: 'Supplier Markup must be a valid number',
        }
      ),
    taxValue: z
      .string()
      .min(1, 'Tax value is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Tax must be a valid number')
      .refine(
        val => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        {
          message: 'Tax must be a valid number',
        }
      ),
  })
  .refine(
    data => {
      if (data.supplierMarkupType === 'percentage') {
        const num = parseFloat(data.supplierMarkupValue);
        return !isNaN(num) && num >= 1 && num <= 100;
      }
      return true;
    },
    {
      message: 'Supplier Markup percentage must be between 1 and 100',
      path: ['supplierMarkupValue'],
    }
  )
  .refine(
    data => {
      if (data.supplierMarkupType === 'amount') {
        const num = parseFloat(data.supplierMarkupValue);
        return !isNaN(num) && num >= 0 && num <= 1000000;
      }
      return true;
    },
    {
      message: 'Supplier Markup amount must be between 0 and 1,000,000',
      path: ['supplierMarkupValue'],
    }
  )
  .refine(
    data => {
      // Tax is always percentage, so validate it's between 1 and 100
      const num = parseFloat(data.taxValue);
      return !isNaN(num) && num >= 1 && num <= 100;
    },
    {
      message: 'Tax percentage must be between 1 and 100',
      path: ['taxValue'],
    }
  );

export type PricingRulesInput = z.infer<typeof pricingRulesValidationSchema>;

export const customizationValidationSchema = z.object({
  warrantyText: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export type CustomizationInput = z.infer<typeof customizationValidationSchema>;
