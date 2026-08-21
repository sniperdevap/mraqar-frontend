'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { accountInfoValidationSchema } from '@/lib/schemas/settings';
import { useAuthStore } from '@/lib/store/auth-store';
import { updatePassword } from '@/lib/api/settings';
import { getErrorMessage } from '@/lib/utils/api';
import { useTranslations } from 'next-intl';

type AccountInfoFormValues = z.infer<typeof accountInfoValidationSchema>;

export function AccountInfoTab() {
  const { user } = useAuthStore();
  const t = useTranslations('common');
  const tErrors = useTranslations('common.errors');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoValidationSchema),
    defaultValues: {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: AccountInfoFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.success) {
        toast.success(t('messages.passwordUpdated'));
        form.reset({
          email: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Error updating password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Account Information</h2>
        <p className="text-secondary/70">Update your account information</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-6 md:gap-1 gap-3">
            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-primary font-medium text-lg">Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} placeholder="e.g auto_1234" className="rounded-lg bg-white border-gray-300 pr-12" {...field} preventAllSpaces />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="md:min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-primary font-medium text-lg">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showNewPassword ? 'text' : 'password'} placeholder="e.g auto_1234" className="rounded-lg bg-white border-gray-300 pr-12" {...field} preventAllSpaces />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="md:min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-primary font-medium text-lg">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="e.g auto_1234" className="rounded-lg bg-white border-gray-300 pr-12" {...field} preventAllSpaces />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="md:min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-primary text-white hover:opacity-95 px-8 py-6 rounded-lg w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed relative min-w-[140px]"
            >
              <span className={isSubmitting ? 'opacity-0' : ''}>Save Changes</span>
              {isSubmitting && <span className="absolute inset-0 flex items-center justify-center">Saving...</span>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
