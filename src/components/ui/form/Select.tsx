import React, { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none rounded-2xl border-0 bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors cursor-pointer ${
              error ? 'ring-2 ring-red-500' : ''
            } ${className}`}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
