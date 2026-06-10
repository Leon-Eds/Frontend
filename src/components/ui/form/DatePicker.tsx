import React, { InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            type="date"
            ref={ref}
            className={`w-full rounded-2xl border-0 bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors cursor-pointer ${
              error ? 'ring-2 ring-red-500' : ''
            } ${className} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
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
