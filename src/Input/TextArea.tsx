import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaProps {
  name: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
}

const TextArea: React.FC<TextAreaProps> = ({ name, placeholder, rows = 3, value, onChange, onBlur }) => {
  return <Textarea name={name} placeholder={placeholder} rows={rows} className="shadcn-textarea" value={value} onChange={onChange} onBlur={onBlur} />;
};

export default TextArea;
