'use client';

import { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { customerDetailsValidationSchema } from '@/lib/schemas/lookup';
import { toast } from 'sonner';

type CustomerDetailsFormValues = z.infer<typeof customerDetailsValidationSchema>;

export interface CustomerDetailsFormRef {
  getValues: () => CustomerDetailsFormValues | null;
  isValid: () => boolean;
  triggerValidation: () => Promise<boolean>;
  triggerSendQuoteValidation: () => Promise<boolean>;
  canSendQuote: () => boolean;
}

interface CustomerDetailsFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

export const CustomerDetailsForm = forwardRef<CustomerDetailsFormRef, CustomerDetailsFormProps>(({ onValidationChange }, ref) => {
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsValidationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  // Check if either phone or email is provided (for send quote button)
  const checkCanSendQuote = (): boolean => {
    const values = form.getValues();
    const hasPhone = Boolean(values.phone && values.phone.trim() !== '');
    const hasEmail = Boolean(values.email && values.email.trim() !== '');
    return hasPhone || hasEmail;
  };

  // Notify parent of validation state changes for send quote button
  useEffect(() => {
    const subscription = form.watch(() => {
      const values = form.getValues();
      const hasPhone = Boolean(values.phone && values.phone.trim() !== '');
      const hasEmail = Boolean(values.email && values.email.trim() !== '');
      const canSend = hasPhone || hasEmail;
      onValidationChange?.(canSend);
    });
    return () => subscription.unsubscribe();
  }, [form, onValidationChange]);

  useImperativeHandle(ref, () => ({
    getValues: () => {
      return form.getValues();
    },
    isValid: () => {
      return form.formState.isValid;
    },
    triggerValidation: async () => {
      const isValid = await form.trigger();
      onValidationChange?.(checkCanSendQuote());
      return isValid;
    },
    triggerSendQuoteValidation: async () => {
      const isValid = await form.trigger();
      if (!isValid) {
        onValidationChange?.(false);
        return false;
      }

      const values = form.getValues();
      const hasPhone = values.phone && values.phone.trim() !== '';
      const hasEmail = values.email && values.email.trim() !== '';

      if (!hasPhone && !hasEmail) {
        const errorMessage = 'Either phone number or email is required to send a quote.';
        toast.error(errorMessage);
        onValidationChange?.(false);
        return false;
      }

      // Clear any errors
      form.clearErrors();
      onValidationChange?.(true);
      return true;
    },
    canSendQuote: () => {
      return checkCanSendQuote();
    },
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-primary">Customer Details</h3>

      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm font-normal text-primary">Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g John Smith" className=" border-gray-300 rounded-lg font-normal text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm font-normal text-primary">Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="e.g (775) 980-2006" className=" border-gray-300 rounded-lg font-normal text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="text-sm font-normal text-primary">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="e.g johnsmith@gmail.com"
                    className=" border-gray-300 rounded-lg font-normal text-sm"
                    {...field}
                    onChange={e => {
                      const value = e.target.value.replace(/\s/g, '');
                      field.onChange(value);
                    }}
                    onBlur={e => {
                      field.onChange(e.target.value.trim());
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
});

CustomerDetailsForm.displayName = 'CustomerDetailsForm';
