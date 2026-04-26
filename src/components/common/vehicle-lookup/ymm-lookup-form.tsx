'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import type { YMMLookupInput } from '@/lib/schemas/lookup';

interface YMMLookupFormProps {
  form: UseFormReturn<YMMLookupInput>;
  onSubmit: (values: YMMLookupInput) => void;
}

export function YMMLookupForm({ form, onSubmit }: YMMLookupFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Three fields wrapper - Year, Make, Model - takes 4 columns on XL, full width on MD/LG */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {/* Year - First row on MD/LG */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                <FormControl>
                  <Input placeholder="Year" className=" border-primary-gray-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Make - First row on MD/LG */}
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                <FormControl>
                  <Input placeholder="Make" className=" border-primary-gray-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model - Second row on MD/LG */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                <FormControl>
                  <Input placeholder="Model" className=" border-primary-gray-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="hidden md:block xl:hidden">
            <FormField
              control={form.control}
              name="part"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full border-primary-gray-input justify-center gap-3 !h-13">
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

        {/* Part field - Second row on MD/LG, aligned right on XL, 150px width, 1 column */}
        <div className="md:hidden xl:block col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-1 xl:w-full xl:ml-auto">
          <FormField
            control={form.control}
            name="part"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full border-primary-gray-input justify-center gap-3 !h-12 lg:!h-13">
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

        {/* Button - Third row on MD/LG aligned right, aligned right on XL, 150px width, 1 column */}
        <div className="col-span-1 md:col-span-4  md:flex md:justify-center xl:col-span-1 xl:w-full xl:ml-auto flex items-start">
          <Button type="submit" className="w-full md:w-2/5  xl:w-full h-12 lg:h-13 bg-blue-primary hover:bg-blue-primary/90 rounded-md">
            Get My Glass
          </Button>
        </div>
      </form>
    </Form>
  );
}
