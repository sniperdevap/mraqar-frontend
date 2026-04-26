'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { serviceLineValidationSchema } from '@/lib/schemas/lookup';
import { Service } from './services';

type ServiceLineFormValues = z.infer<typeof serviceLineValidationSchema>;

interface ServiceLineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Omit<Service, 'id' | 'quantity' | 'total'>) => Promise<void>;
  editData?: Service | null;
}

export function ServiceLineModal({ open, onOpenChange, onSave, editData }: ServiceLineModalProps) {
  const isEditMode = !!editData;
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ServiceLineFormValues>({
    resolver: zodResolver(serviceLineValidationSchema),
    defaultValues: {
      serviceName: '',
      description: '',
      price: '',
    },
  });

  useEffect(() => {
    if (open && editData) {
      form.reset({
        serviceName: editData.name,
        description: editData.description,
        price: editData.price.toString(),
      });
    } else if (open && !editData) {
      form.reset({
        serviceName: '',
        description: '',
        price: '',
      });
    }
  }, [open, editData, form]);

  const handleSubmit = async (values: ServiceLineFormValues) => {
    try {
      setIsSaving(true);
      const priceNumber = parseFloat(values.price) || 0;
      await onSave({
        name: values.serviceName.trim(),
        description: values.description?.trim() || '',
        price: priceNumber,
      });
      form.reset();
      onOpenChange(false);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl p-6 md:p-10 bg-white" showCloseButton={false}>
        <DialogHeader className="text-left mb-4 sm:mb-6 gap-1">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight">{isEditMode ? 'Edit Service Line' : 'Create New Service '}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-normal text-secondary/50">{isEditMode ? '' : 'Create  new services by adding name, description and price.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Service Name */}
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-base sm:text-lg font-semibold text-primary">Service Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g Labor" className="border-secondary focus:border-secondary rounded-lg mt-2 w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-base sm:text-lg font-semibold text-primary">Description</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g quick and easy setup to get your system up."
                      className="border-secondary focus:border-secondary resize-none rounded-lg mt-2 w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-base sm:text-lg font-semibold text-primary">Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g 234"
                      className="border-secondary focus:border-secondary rounded-lg mt-2 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      preventAllSpaces
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-row justify-end gap-3 mt-6 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="border-[#E2E2E2] text-secondary flex-1 md:flex-none md:w-36 hover:bg-gray-50 px-4 sm:px-6 rounded-lg font-normal text-sm sm:text-base h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white flex-1 md:flex-none md:w-36 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base disabled:!bg-[#A3A3A3] disabled:!cursor-not-allowed disabled:hover:!bg-gray-300 disabled:!opacity-100 h-11"
              >
                <span className="inline-flex items-center justify-center min-w-[120px]">{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
