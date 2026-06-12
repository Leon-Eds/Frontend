import React, { InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', value, onChange, ...props }, ref) => {
    // Format yyyy-mm-dd to dd/mm/yyyy for display
    const formattedValue = value ? (() => {
      const parts = String(value).split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return value;
    })() : '';

    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          {label}
        </label>
        <div className="relative h-[56px] w-full rounded-2xl bg-gray-100 focus-within:ring-2 focus-within:ring-[#053d26] focus-within:bg-white overflow-hidden transition-colors">
          {/* Custom Display Layer */}
          <div className={`absolute inset-0 flex items-center pl-5 pr-12 pointer-events-none ${!formattedValue ? 'text-gray-400' : 'text-gray-900'}`}>
            {formattedValue || 'dd/mm/yyyy'}
          </div>
          
          {/* Invisible Native Picker overlay */}
          <input
            type="date"
            ref={ref}
            value={value}
            onChange={onChange}
            className={`opacity-0 absolute inset-0 w-full h-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
              error ? 'ring-2 ring-red-500' : ''
            } ${className}`}
            onClick={(e) => {
              try {
                (e.target as any).showPicker();
              } catch (err) {
                console.warn("showPicker not supported", err);
              }
              if (props.onClick) props.onClick(e);
            }}
            {...props}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
