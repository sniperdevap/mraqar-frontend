import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller, useFormContext } from 'react-hook-form';

type SelectOption = {
  label: string;
  value: string;
};

interface SelectProps {
  name: string;
  options: SelectOption[];
  placeholder?: string;
  control?: import('react-hook-form').Control<import('react-hook-form').FieldValues>;
}

const SelectComponent = ({ name, options, placeholder, control }: SelectProps) => {
  const {
    control: formControl,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="w-full">
      <Controller
        name={name}
        control={control || formControl}
        render={({ field }: { field: { value: string; onChange: (val: string) => void } }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder || 'Select'} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errorMessage && <span className="text-red-500 text-sm mt-1 block">{errorMessage}</span>}
    </div>
  );
};

export default SelectComponent;
