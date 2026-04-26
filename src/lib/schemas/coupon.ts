import { z } from 'zod';

// Create coupon validation schema
export const createCouponValidationSchema = z.object({
  couponCode: z.string().trim().min(1, 'Coupon code is required').max(50, 'Coupon code must be less than 50 characters').regex(/^\S+$/, 'Coupon code cannot contain spaces'),
  discountValue: z
    .string()
    .min(1, 'Discount value is required')
    .refine(
      val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          return false;
        }
        return num >= 1 && num <= 100;
      },
      {
        message: 'Discount value must be a positive number between 1 and 100',
      }
    ),
  userLimit: z
    .string()
    .min(1, 'Usage limit is required')
    .refine(
      val => {
        const num = parseInt(val, 10);
        if (isNaN(num)) {
          return false;
        }
        if (num < 1) {
          return false;
        }
        return Number.isInteger(num);
      },
      {
        message: 'Usage limit must be a positive number',
      }
    ),
  expiryDate: z
    .date({
      message: 'Expiry date is required',
    })
    .refine(
      date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: 'Expiry date must be today or in the future',
      }
    ),
});
