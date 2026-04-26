import { Input } from '@/components/ui/input';
import React from 'react';

type TextProps = {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

const Text: React.FC<TextProps> = ({ name, type = 'text', placeholder, value, onChange, onBlur, disabled }) => {
  return (
    <Input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="shadcn-input disabled:bg-gray-200 disabled:cursor-not-allowed"
      autoComplete="off"
      disabled={disabled}
    />
  );
};

export default Text;
