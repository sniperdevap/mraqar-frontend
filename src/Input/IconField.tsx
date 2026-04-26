import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface IconFieldProps {
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const IconField: React.FC<IconFieldProps> = ({ name, value, onChange, onBlur, placeholder, icon, type = 'text', className = '', disabled = false }) => {
  return (
    <div className={cn('relative', className)}>
      <Input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} onBlur={onBlur} autoComplete="off" disabled={disabled} className="pr-10" />
      {icon && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">{icon}</div>}
    </div>
  );
};

export default IconField;
