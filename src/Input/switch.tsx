import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SwitchFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SwitchField: React.FC<SwitchFieldProps> = ({ checked, onCheckedChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export default SwitchField;
