import React from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PhoneMaskProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

const PhoneMask: React.FC<PhoneMaskProps> = ({ placeholder, value, onChange, onBlur }) => {
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const [, area, middle, last] = match;
      if (area && middle && last) return `(${area}) ${middle}-${last}`;
      if (area && middle) return `(${area}) ${middle}`;
      if (area) return `(${area}`;
    }
    return value;
  };

  return (
    <div className="relative">
      <Input
        value={formatPhoneNumber(value || '')}
        onChange={e => onChange?.(formatPhoneNumber(e.target.value))}
        onBlur={onBlur}
        placeholder={placeholder || 'Enter your phone number'}
        className="w-full pr-12"
        inputMode="tel"
      />
      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
        <Phone size={20} />
      </div>
    </div>
  );
};

export default PhoneMask;
