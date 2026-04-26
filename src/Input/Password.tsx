import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { FieldError } from 'react-hook-form';

interface PasswordProps {
  name: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  errors?: Record<string, FieldError>;
  disabled?: boolean;
}

const Password: React.FC<PasswordProps> = ({ name, value, onChange, onBlur, placeholder, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="w-full pr-10 disabled:bg-gray-200 disabled:cursor-not-allowed"
        autoComplete="off"
        disabled={disabled}
      />
      <div onClick={() => setShowPassword(prev => !prev)} className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer">
        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
      </div>
    </div>
  );
};

export default Password;
