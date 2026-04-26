import React from 'react';
import { Input } from '@/components/ui/input';

interface NumberFieldProps {
  name: string;
  value?: number | string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({ name, value, onChange, onBlur, placeholder }) => {
  return (
    <Input
      name={name}
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="w-full"
      autoComplete="off"
      step="any" // Optional: allow decimals
    />
  );
};

export default NumberField;
