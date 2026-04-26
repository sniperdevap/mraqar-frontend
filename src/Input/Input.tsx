import React from 'react';

import NumberField from './NumberField';
import IconField from './IconField';
import Password from './Password';
import Radio from './Radio';
import TextArea from './TextArea';
import DateField from './DateFIeld';
import MultiDateField from './MultiDateField';
import DateRangeField from './DateRangeField';
import PhoneMask from './PhoneMask';
import Text from './Text';
import SelectComponent from './Select';
import SwitchField from './switch';
import { CheckboxField } from './CheckboxFieldProps';
import { FormField, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type InputType = 'text' | 'switch' | 'checkbox' | 'number' | 'iconfield' | 'password' | 'radio' | 'textarea' | 'select' | 'date' | 'multiDate' | 'dateRange' | 'phonemask';

import { Control, FieldValues, Path } from 'react-hook-form';

interface InputProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder: string;
  type: InputType;
  control?: Control<T>;
  errors?: Record<string, unknown>;
  inline?: boolean;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

const inputComponents: Record<InputType, React.ElementType> = {
  text: Text,
  number: NumberField,
  iconfield: IconField,
  password: Password,
  radio: Radio,
  textarea: TextArea,
  select: SelectComponent,
  date: DateField,
  multiDate: MultiDateField,
  dateRange: DateRangeField,
  phonemask: PhoneMask,
  switch: SwitchField,
  checkbox: CheckboxField,
};

const Input = <T extends FieldValues = FieldValues>({ name, label, placeholder, type, control, inline, options, disabled = false, icon }: InputProps<T>) => {
  const Component = inputComponents[type];
  const isLabelShownOnSide = type === 'checkbox' || type === 'switch';

  if (!control) {
    return (
      <div className={`formgroup ${inline ? 'form-inline' : ''}`}>
        <div className="gap-1">
          {!isLabelShownOnSide && <label>{label}</label>}
          <div>
            {isLabelShownOnSide ? (
              <div className="flex items-center space-x-2">
                <Component name={name} placeholder={placeholder} type={type} options={options} disabled={disabled} />
                <label className="font-normal">{label}</label>
              </div>
            ) : (
              <Component name={name} placeholder={placeholder} type={type} options={options} disabled={disabled} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`formgroup ${inline ? 'form-inline' : ''}`}>
      <FormField
        name={name}
        control={control}
        render={({ field }: { field: Record<string, unknown> }) => {
          const commonProps = {
            ...field,
            name,
            control,
            placeholder,
            type,
            options,
            disabled,
            ...(type === 'iconfield' ? { icon } : {}),
            ...(type === 'switch' ? { label } : {}),
          };

          return (
            <FormItem className="gap-1">
              {!isLabelShownOnSide && <FormLabel>{label}</FormLabel>}
              <FormControl>
                {isLabelShownOnSide ? (
                  <div className="flex items-center space-x-2">
                    <Component {...commonProps} />
                    <FormLabel className="font-normal">{label}</FormLabel>
                  </div>
                ) : (
                  <Component {...commonProps} />
                )}
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default Input;
