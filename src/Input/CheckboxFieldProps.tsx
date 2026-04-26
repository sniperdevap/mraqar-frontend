import { Checkbox } from '@/components/ui/checkbox';

type CheckboxFieldProps = {
  name: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const CheckboxField = ({ name, checked, onCheckedChange }: CheckboxFieldProps) => {
  return (
    <div className="flex flex-row items-center space-x-2 space-y-0">
      <Checkbox className="m-0" checked={checked} onCheckedChange={onCheckedChange} id={name} />
    </div>
  );
};

export { CheckboxField };
