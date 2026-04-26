'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { UseFormReturn } from 'react-hook-form';
import type { VinLookupInput } from '@/lib/schemas/lookup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VinLookupFormProps {
  form: UseFormReturn<VinLookupInput>;
  onSubmit: (values: VinLookupInput) => void;
}

export function VinLookupForm({ form, onSubmit }: VinLookupFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="mt-8 flex flex-col xl:flex-row gap-3 mb-3">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="w-full">
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter 17-characters VIN" className=" border-primary-gray-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full xl:w-[150px]">
              <FormField
                control={form.control}
                name="part"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full border-primary-gray-input justify-center gap-2 !h-12 lg:!h-13">
                          <SelectValue placeholder="Windshield" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Windshield">Windshield</SelectItem>
                          <SelectItem value="Back Glass">Back Glass</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="w-full  xl:w-[150px] flex items-start justify-center">
            <Button type="submit" className="w-full md:w-2/5  xl:w-full h-12 lg:h-13 bg-blue-primary hover:bg-blue-primary/90 rounded-md">
              Get My Glass
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
