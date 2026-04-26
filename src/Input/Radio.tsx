import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioProps {
  name: string;
  options: RadioOption[];
  label?: string;
}

const RadioComponent: React.FC<RadioProps> = ({ name, options, label }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <fieldset className="space-y-2">
        {label && <legend className="text-sm font-medium text-gray-700">{label}</legend>}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {options.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {errorMessage && <span className="text-sm text-red-500">{errorMessage}</span>}
      </fieldset>
    </div>
  );
};

export default RadioComponent;
