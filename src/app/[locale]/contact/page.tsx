'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useSearchParams, useRouter } from 'next/navigation';
import { createContact, deleteAccount } from '@/lib/api/account';
import { useAuthStore } from '@/lib/store/auth-store';

export default function ContactPage() {
  const t = useTranslations('common.contact');
  const { direction } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action');
  const logout = useAuthStore(state => state.logout);

  const contactFormSchema = z.object({
    fullName: z.string().min(2, t('validation.fullName')),
    email: z.string().email(t('validation.email')),
    subject: z.string().min(1, t('validation.subject')),
    message: z.string().min(10, t('validation.message')),
  });

  type ContactFormValues = z.infer<typeof contactFormSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      subject: action === 'delete' ? 'delete-account' : '',
      message: '',
    },
  });

  useEffect(() => {
    if (action === 'delete') {
      form.setValue('subject', 'delete-account');
      form.setValue('message', 'I would like to delete my account.');
    }
  }, [action, form]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      console.log('Form submitted:', data);
      await createContact({
        ...data,
        action: action === 'delete' ? 'delete' : undefined,
      });

      if (action === 'delete') {
        await deleteAccount();
        toast.success(t('deleteSuccessMessage'));
        logout();
        window.location.href = '/';
      } else {
        toast.success(t('successMessage'));
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50" dir={direction}>
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Text */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">{t('description')}</p>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Form Content */}
            <div className="p-5 sm:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            {t('fullName')} <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={t('fullNamePlaceholder')} className="h-10.5 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-0 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            {t('email')} <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('emailPlaceholder')} className="h-10.5 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-0 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          {t('subject')} <span className="text-red-400">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={action === 'delete'}>
                          <FormControl>
                            <SelectTrigger className="h-10.5 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-0 text-sm">
                              <SelectValue placeholder={t('subjectPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">{t('subjects.general')}</SelectItem>
                            <SelectItem value="support">{t('subjects.support')}</SelectItem>
                            <SelectItem value="listing">{t('subjects.listing')}</SelectItem>
                            <SelectItem value="partnership">{t('subjects.partnership')}</SelectItem>
                            <SelectItem value="feedback">{t('subjects.feedback')}</SelectItem>
                            <SelectItem value="delete-account">{t('subjects.deleteAccount') || 'Delete Account'}</SelectItem>
                            <SelectItem value="other">{t('subjects.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Message Textarea */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          {t('message')} <span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('messagePlaceholder')} className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-0 text-sm resize-none" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-center pt-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white px-10 h-10.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                      {action === 'delete' ? 'Delete Account' : t('sendButton')}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
